<template>
  <footer class="mt-24 border-t border-[#e2e8f0] bg-[#f8fafc]">
    <div class="site-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <NuxtLink to="/" aria-label="PDFEasy home" class="inline-flex w-[200px] items-center mix-blend-multiply">
          <BrandLogo />
        </NuxtLink>
        <p class="mt-4 max-w-[320px] text-sm leading-7 text-[#64748b]">Free, practical PDF tools built independently by a freelance developer. Simple to use, with files processed in your browser.</p>
      </div>
      <div>
        <h2 class="mb-4 text-sm font-bold text-ink">Resources</h2>
        <div class="grid gap-3 text-sm text-[#64748b]">
          <NuxtLink to="/merge-pdf" class="hover:text-brand">Merge PDF</NuxtLink>
          <NuxtLink to="/guides" class="hover:text-brand">All PDF guides</NuxtLink>
          <NuxtLink to="/guides/how-to-merge-pdf" class="hover:text-brand">How to merge PDFs</NuxtLink>
          <NuxtLink to="/guides/is-online-pdf-merging-safe" class="hover:text-brand">PDF privacy guide</NuxtLink>
          <NuxtLink to="/guides/organize-pdf-files" class="hover:text-brand">Organize PDF documents</NuxtLink>
        </div>
      </div>
      <div>
        <h2 class="mb-4 text-sm font-bold text-ink">About &amp; Support</h2>
        <div class="grid gap-3 text-sm text-[#64748b]">
          <NuxtLink to="/about" class="hover:text-brand">About PDFEasy</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-brand">Contact</NuxtLink>
          <NuxtLink to="/privacy-policy" class="hover:text-brand">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-brand">Terms of Use</NuxtLink>
        </div>
      </div>
    </div>
    <div class="border-t border-[#e2e8f0]">
      <div class="site-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-[#94a3b8]">
        <span>© {{ new Date().getFullYear() }} PDFEasy. All rights reserved.</span>
        <span>An independent developer project.</span>
      </div>
    </div>
  </footer>
</template>
