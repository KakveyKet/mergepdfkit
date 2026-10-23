<script setup>
usePageSeo({ title:'Contact PDFEasy — Questions and Feedback', description:'Contact PDFEasy about PDF merging issues, website feedback, or privacy questions.', path:'/contact' })
const config = useRuntimeConfig()
const email = computed(() => String(config.public.contactEmail || 'kakveyket408@gmail.com').trim())
</script>
<template>
  <main class="site-container max-w-[800px]! pt-14 sm:pt-20 prose-custom">
    <p class="text-brand! font-extrabold text-sm uppercase tracking-[.18em]">Contact</p>
    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Have a question or suggestion?</h1>
    <p>Send feedback about PDFEasy, report a merging issue, or suggest a feature for this independent developer project. Please do not send private or confidential documents with feedback.</p>
    <div class="surface-card p-6 sm:p-8 mt-8">
      <h2 class="mt-0!">Get in touch</h2>
      <p>For support, feedback, and privacy questions, email:</p>
      <a :href="`mailto:${email}`" class="text-lg font-bold break-all">{{ email }}</a>
      <p class="text-sm">When reporting a bug, include your browser, the approximate file sizes and the error message — but not the document contents.</p>
    </div>
  </main>
</template>
