<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const adWrapper = ref(null);
let adScript = null;

// Replace both values using your actual
// Adsterra NativeBanner_1 code.
const scriptUrl = "https://bauval.org/21/e6927210cb12a0f211ff6a0040cbc66a";
const containerId = "container-e6927210cb12a0f211ff6a0040cbc66a";

onMounted(() => {
  if (!adWrapper.value) return;

  adScript = document.createElement("script");
  adScript.src = scriptUrl;
  adScript.async = true;
  adScript.setAttribute("data-cfasync", "false");

  adWrapper.value.appendChild(adScript);
});

onBeforeUnmount(() => {
  adScript?.remove();
});
</script>

<template>
  <section
    class="mx-auto my-8 w-full max-w-6xl px-4"
    aria-label="Advertisement"
  >
    <p class="mb-3 text-center text-xs text-slate-400"></p>

    <div ref="adWrapper">
      <div :id="containerId"></div>
    </div>
  </section>
</template>
