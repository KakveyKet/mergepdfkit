<script setup>
import { pdfTools } from '~/utils/toolCatalog.mjs'
usePageSeo({ title: 'All Free PDF Tools — Merge, Split, Rotate & Convert | PDFEasy', description: 'Free browser-based PDF tools: merge PDFs, split pages, JPG to PDF, rotate pages and organize documents. No sign-up or document uploads.', path: '/tools' })
</script>
<template>
  <main>
    <section class="border-b border-slate-100 bg-[#f8fbff]"><div class="site-container py-16 text-center sm:py-20"><p class="eyebrow">Everything in one place</p><h1 class="mt-3 text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-.05em] text-ink">Free PDF tools, made simple.</h1><p class="mx-auto mt-4 max-w-[600px] text-base leading-8 text-slate-600">Work with PDFs in a few clicks. Your documents are processed in your browser, not sent to a conversion server.</p></div></section>
    <section class="site-container pt-12 sm:pt-16">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="tool in pdfTools" :key="tool.to" :to="tool.to" class="group flex flex-col rounded-[18px] border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5">
          <div class="flex items-start justify-between gap-3"><span class="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-2xl font-bold text-brand">{{ tool.icon }}</span><span v-if="tool.tag" class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{{ tool.tag }}</span></div>
          <h2 class="mt-5 text-xl font-extrabold tracking-tight text-ink group-hover:text-brand">{{ tool.name }}</h2><p class="mt-2 flex-1 text-sm leading-7 text-slate-600">{{ tool.desc }}</p><span class="mt-5 text-sm font-bold text-brand">Open tool →</span>
        </NuxtLink>
        <div class="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 p-6"><span class="grid h-12 w-12 place-items-center rounded-xl bg-white text-2xl text-slate-400">⇣</span><div class="mt-5 flex items-center gap-2"><h2 class="text-xl font-extrabold text-slate-700">Compress PDF</h2><span class="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500">Planned</span></div><p class="mt-2 text-sm leading-7 text-slate-600">We're evaluating safe size reduction that doesn't unexpectedly remove searchable text or degrade your document.</p></div>
      </div>
      <div class="mt-12 rounded-2xl border border-blue-100 bg-blue-50 px-6 py-8 sm:px-9"><h2 class="text-xl font-extrabold text-ink">What happens to my files?</h2><p class="mt-2 max-w-[780px] text-sm leading-7 text-slate-600">PDFEasy performs these document operations locally in your browser. The source PDFs and images do not need to be uploaded to a PDF processing server. Website assets and optional analytics or advertisements may still involve network requests; read our <NuxtLink to="/privacy-policy" class="font-bold text-brand underline">Privacy Policy</NuxtLink> for details.</p></div>
    </section>
  </main>
</template>
