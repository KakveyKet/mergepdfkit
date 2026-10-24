<script setup>
usePageSeo({
  title: 'About PDFEasy — Independent Free PDF Tools',
  description: 'PDFEasy is a free, privacy-conscious collection of PDF tools built by an independent freelance developer.',
  path: '/about'
})
</script>

<template>
  <main class="site-container max-w-[800px]! pt-14 sm:pt-20 prose-custom">
    <p class="text-brand! font-extrabold text-sm uppercase tracking-[.18em]">About PDFEasy</p>
    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">PDF tools made simple.</h1>
    <p>PDFEasy is an independent web project created by a freelance developer. It is not presented as a company or a corporate PDF service. The goal is straightforward: offer helpful tools that make everyday PDF tasks easier.</p>
    <h2>What you can do</h2>
    <p>PDFEasy offers browser-based tools for merging multiple PDF files, splitting or extracting pages, rotating pages, organizing a document, and converting JPG or PNG images into a PDF. Each feature has step-by-step instructions, clear limits, and a downloadable result.</p>
    <p>Processing runs on your device rather than on a PDF conversion server. No account or installation is required. Modern browsers are supported, subject to device memory and the complexity of your files.</p>
    <h2>What matters here</h2>
    <ul>
      <li>Simple, readable steps for first-time users.</li>
      <li>No forced sign-up or payment for the available PDF tools.</li>
      <li>Clear file limits and helpful error messages.</li>
      <li>Honest explanations of the tool's capabilities and limitations.</li>
    </ul>
    <p>Have a question, found a bug, or want to suggest a feature? Visit the <NuxtLink to="/contact">Contact page</NuxtLink>. For information about file processing, hosting, and third-party resources, see the <NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>.</p>
  </main>
</template>
