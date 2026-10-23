<script setup>
usePageSeo({
  title: 'About PDFEasy — An Independent Free PDF Tool',
  description: 'PDFEasy is a free, privacy-conscious PDF merging website built by an independent freelance developer.',
  path: '/about'
})
</script>

<template>
  <main class="site-container max-w-[800px]! pt-14 sm:pt-20 prose-custom">
    <p class="text-brand! font-extrabold text-sm uppercase tracking-[.18em]">About PDFEasy</p>
    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">PDF tools made simple.</h1>
    <p>PDFEasy is an independent web project created by a freelance developer. It is not presented as a company or a corporate PDF service. The goal is straightforward: offer helpful tools that make everyday PDF tasks easier.</p>
    <h2>How PDF merging works</h2>
    <p>Select your PDF files, arrange them in the correct order, and download one combined document. The merging process runs directly in your browser, without sending your chosen PDFs to a PDF processing server.</p>
    <p>No account or software installation is required. The tool works on modern desktop and mobile browsers, depending on the available device memory and PDF complexity.</p>
    <h2>What matters here</h2>
    <ul>
      <li>Simple, readable steps for first-time users.</li>
      <li>No forced sign-up or payment to merge PDFs.</li>
      <li>Clear file limits and helpful error messages.</li>
      <li>Honest explanations of the tool's capabilities and limitations.</li>
    </ul>
    <p>Have a question, found a bug, or want to suggest a feature? Visit the <NuxtLink to="/contact">Contact page</NuxtLink>. For information about file processing, hosting, and third-party resources, see the <NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>.</p>
  </main>
</template>
