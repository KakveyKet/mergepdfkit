<script setup>
import { ref, watch } from 'vue'

const menuOpen = ref(false)
const route = useRoute()
const links = [
  { label: 'Merge PDF', to: '/merge-pdf' },
  { label: 'PDF Guides', to: '/guides' },
  { label: 'About', to: '/about' }
]
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-xl">
    <div class="site-container flex h-[72px] items-center justify-between gap-4">
      <NuxtLink to="/" aria-label="PDFEasy home" class="inline-flex w-[174px] shrink-0 items-center sm:w-[212px]">
        <BrandLogo />
      </NuxtLink>

      <nav class="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
        <NuxtLink
          v-for="link in links" :key="link.to" :to="link.to"
          class="rounded-lg px-4 py-2 text-sm font-semibold text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-ink"
          active-class="!text-brand !bg-[#eff6ff]"
        >{{ link.label }}</NuxtLink>
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        <span class="flex items-center gap-2 text-xs font-semibold text-[#64748b]"><span class="h-1.5 w-1.5 rounded-full bg-[#3b82f6]"></span> Free, no sign-up</span>
        <NuxtLink to="/merge-pdf" class="btn-primary px-4! py-2.5! text-sm!">
          Merge PDF <span aria-hidden="true">↗</span>
        </NuxtLink>
      </div>

      <button type="button" class="grid h-10 w-10 place-items-center rounded-xl border border-[#e2e8f0] text-ink lg:hidden" :aria-expanded="menuOpen" aria-controls="mobile-nav" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen">
        <svg v-if="!menuOpen" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg v-else width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <nav v-if="menuOpen" id="mobile-nav" class="site-container flex flex-col gap-1 border-t border-[#e2e8f0] py-3 lg:hidden" aria-label="Mobile navigation">
      <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="rounded-lg px-3 py-3 text-sm font-semibold text-[#475569] hover:bg-brand-soft" @click="menuOpen = false">{{ link.label }}</NuxtLink>
      <NuxtLink to="/merge-pdf" class="btn-primary mt-2" @click="menuOpen = false">Merge PDF now →</NuxtLink>
    </nav>
  </header>
</template>
