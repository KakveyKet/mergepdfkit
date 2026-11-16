<script setup>
import { computed } from "vue";
import { pdfTools } from "~/utils/toolCatalog.mjs";

const route = useRoute();

const knownToolRoutes = [
  "/merge-pdf",
  "/split-pdf",
  "/jpg-to-pdf",
  "/rotate-pdf",
  "/organize-pdf",
  "/add-page-numbers",
  "/watermark-pdf",
  "/pdf-to-jpg",
  "/pdf-to-png",
  "/sign-pdf",
  "/compress-pdf",
  "/crop-pdf",
];

function normalizePath(path) {
  if (!path || path === "/") return "/";

  return path.replace(/\/+$/, "");
}

const catalogToolRoutes = pdfTools
  .map((tool) => tool.to)
  .filter((path) => typeof path === "string");

const toolRoutes = new Set(
  [...knownToolRoutes, ...catalogToolRoutes].map(normalizePath),
);

const currentPath = computed(() => normalizePath(route.path));

const isToolPage = computed(() => toolRoutes.has(currentPath.value));

const showTopAd = computed(
  () =>
    currentPath.value === "/" ||
    currentPath.value === "/tools" ||
    isToolPage.value,
);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SiteHeader />

    <!-- Desktop: 728x90 / Mobile: 320x50 -->
    <ClientOnly>
      <AdsterraBanner
        v-if="showTopAd"
        :key="`top-${currentPath}`"
        placement="top"
      />
    </ClientOnly>

    <NuxtPage class="flex-1" />

    <SiteFooter />
  </div>
</template>
