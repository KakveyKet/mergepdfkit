<script setup>
import { ref, watch } from 'vue'
const menuOpen = ref(false)
const route = useRoute()
const links = [
  { label: 'All Tools', to: '/tools' },
  { label: 'Merge PDF', to: '/merge-pdf' },
  { label: 'PDF Guides', to: '/guides' },
  { label: 'About', to: '/about' }
]
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>
<template>
  <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
    <div class="site-container flex h-[72px] items-center justify-between gap-3">
      <NuxtLink to="/" aria-label="PDFEasy home" class="inline-flex w-[165px] shrink-0 items-center sm:w-[200px]"><BrandLogo /></NuxtLink>
      <nav class="hidden items-center gap-1 lg:flex" aria-label="Main navigation"><NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink" active-class="!bg-blue-50 !text-brand">{{ link.label }}</NuxtLink></nav>
      <NuxtLink to="/tools" class="btn-primary hidden px-4! py-2.5! text-sm! lg:inline-flex">Explore tools ↗</NuxtLink>
      <button type="button" class="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-ink lg:hidden" :aria-expanded="menuOpen" aria-controls="mobile-nav" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen"><svg v-if="!menuOpen" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg v-else width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </div>
    <nav v-if="menuOpen" id="mobile-nav" class="site-container flex flex-col gap-1 border-t border-slate-200 py-3 lg:hidden" aria-label="Mobile navigation"><NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50" @click="menuOpen=false">{{ link.label }}</NuxtLink></nav>
  </header>
</template>
