<template>
  <footer class="mt-24 border-t border-slate-200 bg-slate-50">
    <div class="site-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
      <div><NuxtLink to="/" aria-label="PDFEasy home" class="inline-flex w-[190px] items-center"><BrandLogo /></NuxtLink><p class="mt-4 max-w-[340px] text-sm leading-7 text-slate-600">Practical PDF tools built independently by a freelance developer. No account required. Your documents are processed in your browser.</p></div>
      <div><h2 class="mb-4 text-sm font-bold text-ink">PDF Tools</h2><div class="grid gap-3 text-sm text-slate-600"><NuxtLink to="/tools" class="hover:text-brand">All tools</NuxtLink><NuxtLink to="/merge-pdf" class="hover:text-brand">Merge PDF</NuxtLink><NuxtLink to="/split-pdf" class="hover:text-brand">Split PDF</NuxtLink><NuxtLink to="/jpg-to-pdf" class="hover:text-brand">JPG to PDF</NuxtLink><NuxtLink to="/rotate-pdf" class="hover:text-brand">Rotate PDF</NuxtLink><NuxtLink to="/organize-pdf" class="hover:text-brand">Organize PDF</NuxtLink></div></div>
      <div><h2 class="mb-4 text-sm font-bold text-ink">About &amp; Support</h2><div class="grid gap-3 text-sm text-slate-600"><NuxtLink to="/about" class="hover:text-brand">About PDFEasy</NuxtLink><NuxtLink to="/guides" class="hover:text-brand">PDF Guides</NuxtLink><NuxtLink to="/contact" class="hover:text-brand">Contact</NuxtLink><NuxtLink to="/privacy-policy" class="hover:text-brand">Privacy Policy</NuxtLink><NuxtLink to="/terms" class="hover:text-brand">Terms of Use</NuxtLink></div></div>
    </div>
    <div class="border-t border-slate-200"><div class="site-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-slate-500"><span>© {{ new Date().getFullYear() }} PDFEasy. All rights reserved.</span><span>An independent developer project.</span></div></div>
  </footer>
</template>
