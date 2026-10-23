<script setup>
import { ref } from 'vue'

// Your public Cloudinary logo. To replace it later, update this URL only.
const logoUrl = 'https://res.cloudinary.com/e0brilgp/image/upload/v1792775416/PDFEasy_Merge_Document_Logo.png'
const imageFailed = ref(false)
</script>

<template>
  <span class="inline-flex w-full items-center">
    <img
      v-if="!imageFailed"
      :src="logoUrl"
      alt="PDFEasy"
      width="2172"
      height="724"
      class="block h-auto w-full object-contain"
      decoding="async"
      @error="imageFailed = true"
    >
    <span v-else class="text-xl font-extrabold tracking-tight text-ink">PDF<span class="text-brand">Easy</span></span>
  </span>
</template>
