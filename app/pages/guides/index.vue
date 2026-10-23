<script setup>
usePageSeo({ title: 'PDF Guides — Merge, Organize and Troubleshoot Files | PDFEasy', description: 'Learn how to merge PDFs, solve file errors, manage document order, and understand PDF privacy.', path: '/guides' })
const articles = [
  { title: 'How to merge PDFs step by step', tag: 'Getting started', summary: 'Create one document from multiple PDFs and check the result.', to: '/guides/how-to-merge-pdf' },
  { title: 'How to choose the correct PDF order', tag: 'Planning', summary: 'Organize reports, applications and study notes before merging.', to: '/guides/choose-pdf-order' },
  { title: 'Fix common PDF merging problems', tag: 'Troubleshooting', summary: 'Learn what to do with damaged, locked, or oversized files.', to: '/guides/fix-pdf-merge-problems' },
  { title: 'Is it safe to merge PDF files online?', tag: 'Privacy', summary: 'Understand how browser processing differs from file uploads.', to: '/guides/is-online-pdf-merging-safe' },
  { title: 'How to organize PDF files', tag: 'Productivity', summary: 'Naming, versioning and folder tips for work and school.', to: '/guides/organize-pdf-files' }
]
</script>
<template>
  <main class="site-container pt-14 sm:pt-20">
    <p class="eyebrow">PDFEasy guides</p>
    <h1 class="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Practical guides to simpler PDF work</h1>
    <p class="mt-5 max-w-2xl text-base leading-8 text-slate-600">Clear, tested ways to combine, check, and organize PDFs. No jargon, no unnecessary steps.</p>
    <div class="mt-10 grid gap-4 md:grid-cols-2">
      <NuxtLink v-for="article in articles" :key="article.to" :to="article.to" class="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm sm:p-7">
        <p class="text-xs font-bold uppercase tracking-widest text-brand">{{ article.tag }}</p>
        <h2 class="mt-3 text-xl font-bold tracking-tight text-ink group-hover:text-brand">{{ article.title }}</h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">{{ article.summary }}</p>
        <span class="mt-6 inline-block text-sm font-semibold text-brand">Read guide →</span>
      </NuxtLink>
    </div>
    <div class="mt-12 rounded-2xl bg-blue-50 p-6 sm:p-8">
      <h2 class="text-xl font-bold text-ink">Already have your PDFs ready?</h2>
      <p class="mt-2 text-sm leading-7 text-slate-700">Use our free browser-based merger to combine your documents without uploading them to a processing server.</p>
      <NuxtLink to="/merge-pdf" class="btn-primary mt-5">Open Merge PDF →</NuxtLink>
    </div>
  </main>
</template>
