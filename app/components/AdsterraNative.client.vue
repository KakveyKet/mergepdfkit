<script setup>
import { adsterraNativeConfig } from "~/utils/adsterraNativeConfig.js";

/**
 * PDFEasy Native Banner
 *
 * Keep for future monetization.
 * No iframe or ad script loads when disabled.
 */

const adsEnabled = adsterraNativeConfig.enabled === true;

const bannerUrl = "/ads/native-banner.html";
</script>

<template>
  <section v-if="adsEnabled" class="w-full py-6" aria-label="Advertisement">
    <div class="mx-auto w-full max-w-[950px] px-3">
      <p
        class="mb-4 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400"
      ></p>

      <iframe
        :src="bannerUrl"
        title="PDFEasy Native Advertisement"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        class="block h-[700px] w-full border-0 sm:h-[450px]"
      ></iframe>
    </div>
  </section>
</template>
