<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";

import { adsterraConfig } from "~/utils/adsterraConfig.js";

const props = defineProps({
  placement: {
    type: String,
    default: "top",
    validator: (value) => ["top", "rectangle"].includes(value),
  },
});

const holder = ref(null);
const currentAd = ref(null);
const status = ref("");

const debug = import.meta.dev;

let active = false;
let revision = 0;
let mediaQuery = null;
let externalScript = null;

const showSection = computed(() => {
  return Boolean(currentAd.value || (debug && status.value));
});

function selectBanner() {
  if (props.placement === "rectangle") {
    return adsterraConfig.rectangle;
  }

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  return isMobile ? adsterraConfig.mobile : adsterraConfig.desktop;
}

function validUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value, window.location.href);

    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function validate(config) {
  if (!adsterraConfig.enabled) {
    return "Adsterra is disabled in adsterraConfig.js";
  }

  if (!config) {
    return "No configuration for " + props.placement;
  }

  if (!["iframe", "jsasync", "native"].includes(config.type)) {
    return "Invalid Adsterra type: " + config.type;
  }

  if (
    config.type !== "native" &&
    (typeof config.key !== "string" || !config.key.trim())
  ) {
    return "Adsterra key is missing.";
  }

  if (!validUrl(config.scriptUrl)) {
    return "Adsterra HTTPS script URL is missing or invalid.";
  }

  if (
    !Number.isInteger(config.width) ||
    !Number.isInteger(config.height) ||
    config.width <= 0 ||
    config.height <= 0
  ) {
    return "Banner width or height is invalid.";
  }

  // Container is needed only for these two formats.
  if (["jsasync", "native"].includes(config.type)) {
    if (typeof config.containerId !== "string" || !config.containerId.trim()) {
      return "Container ID is required for " + config.type;
    }
  }

  return "";
}

function cleanup() {
  if (externalScript) {
    externalScript.onload = null;
    externalScript.onerror = null;
    externalScript = null;
  }

  holder.value?.replaceChildren();
}

/**
 * Adsterra standard iframe banner.
 *
 * Runs the synchronous code inside an isolated
 * iframe because some ad scripts use document.write().
 */
function buildIframeDocument(config) {
  const options = {
    key: config.key,
    format: "iframe",
    height: config.height,
    width: config.width,
    params: config.params || {},
  };

  const json = JSON.stringify(options).replace(/</g, "\\u003c");

  const src = validUrl(config.scriptUrl)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

  // Construct tags dynamically for Vue SFC safety.
  const startScript = "<scr" + "ipt";
  const endScript = "</scr" + "ipt>";

  return [
    "<!DOCTYPE html>",
    '<html><head><meta charset="utf-8"></head>',
    '<body style="margin:0;padding:0;overflow:hidden">',
    `${startScript} type="text/javascript">`,
    `window.atOptions=${json};`,
    endScript,
    `${startScript} type="text/javascript" src="${src}">`,
    endScript,
    "</body></html>",
  ].join("");
}

function mountIframe(config, target) {
  const iframe = document.createElement("iframe");

  iframe.title = "Advertisement";
  iframe.width = String(config.width);
  iframe.height = String(config.height);
  iframe.style.width = `${config.width}px`;
  iframe.style.height = `${config.height}px`;
  iframe.style.border = "0";
  iframe.style.display = "block";

  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-popups allow-popups-to-escape-sandbox",
  );

  iframe.srcdoc = buildIframeDocument(config);

  target.appendChild(iframe);
}

/**
 * Native Banner and JSAsync.
 *
 * Render a provider-supplied container ID
 * before inserting the external script.
 */
function mountContainerBanner(config, target, renderId) {
  const container = document.createElement("div");

  container.id = config.containerId;
  target.appendChild(container);

  if (config.type === "jsasync") {
    if (!Array.isArray(window.atAsyncOptions)) {
      window.atAsyncOptions = [];
    }

    window.atAsyncOptions.push({
      key: config.key,
      format: "js",
      async: true,
      container: config.containerId,
      params: config.params || {},
    });
  }

  const script = document.createElement("script");

  script.type = "text/javascript";
  script.async = true;
  script.src = validUrl(config.scriptUrl);
  script.setAttribute("data-cfasync", "false");

  script.onload = () => {
    if (!active || renderId !== revision) return;

    console.debug("[PDFEasy Ads] Script loaded:", props.placement);
  };

  script.onerror = () => {
    if (!active || renderId !== revision) return;

    status.value = "Adsterra script failed to load.";

    console.warn("[PDFEasy Ads] Script failed:", props.placement);
  };

  externalScript = script;
  target.appendChild(script);
}

async function initializeBanner() {
  const renderId = ++revision;

  cleanup();
  status.value = "";

  const config = selectBanner();
  const error = validate(config);

  if (error) {
    currentAd.value = null;
    status.value = error;
    console.warn("[PDFEasy Ads]", error);
    return;
  }

  currentAd.value = config;

  await nextTick();

  if (!active || renderId !== revision || !holder.value) {
    return;
  }

  const target = holder.value;

  if (config.type === "iframe") {
    mountIframe(config, target);
  } else {
    mountContainerBanner(config, target, renderId);
  }
}

function onScreenChange() {
  if (props.placement === "top") {
    void initializeBanner();
  }
}

onMounted(() => {
  active = true;

  mediaQuery = window.matchMedia("(max-width: 767px)");

  mediaQuery.addEventListener("change", onScreenChange);

  void initializeBanner();
});

onBeforeUnmount(() => {
  active = false;
  revision++;

  mediaQuery?.removeEventListener("change", onScreenChange);

  cleanup();
});
</script>

<template>
  <section v-if="showSection" class="w-full py-5" aria-label="Advertisement">
    <div class="mx-auto flex w-full max-w-6xl flex-col items-center px-3">
      <p
        v-if="currentAd"
        class="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400"
      >
        Advertisement
      </p>

      <div
        v-if="currentAd"
        class="max-w-full overflow-hidden"
        :style="{
          width: `${currentAd.width}px`,
          minHeight: `${currentAd.height}px`,
        }"
      >
        <div ref="holder"></div>
      </div>

      <!-- Only visible when running npm run dev -->
      <p
        v-if="debug && status"
        class="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-800"
      >
        PDFEasy Ads: {{ status }}
      </p>
    </div>
  </section>
</template>
