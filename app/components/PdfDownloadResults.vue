<script setup>
import { triggerDownload } from '~/utils/pdf-toolkit.mjs'
defineProps({ items: { type: Array, default: () => [] } })
</script>
<template>
  <div v-if="items.length" role="status" aria-live="polite" class="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
    <p class="font-bold text-blue-950">Your PDF{{ items.length === 1 ? ' is' : 's are' }} ready</p>
    <p class="mt-1 text-xs leading-6 text-blue-800">If a download was blocked, use the buttons below. Check your PDF before sharing.</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <button v-for="item in items" :key="item.filename" class="btn-primary" type="button" @click="triggerDownload(item)">↓ {{ item.filename }}</button>
    </div>
  </div>
</template>
