<script setup>
import { pdfTools } from '~/utils/toolCatalog.mjs'
usePageSeo({ title: 'PDFEasy — Free Online PDF Tools, Simple & Private', description: 'Free PDF tools to merge, split, rotate, organize and convert JPG images to PDFs. No signup, local browser processing.', path: '/' })
const steps = [
  { number: '01', title: 'Choose a tool', body: 'Pick the PDF action you want—merge, split, convert, rotate, or organize.' },
  { number: '02', title: 'Select your files', body: 'Choose a document or pictures from your device and adjust the settings.' },
  { number: '03', title: 'Download', body: 'Create your updated PDF directly in the browser and save it.' }
]
const guides = [
  { label: 'GETTING STARTED', title: 'How to merge PDF files in order', body: 'Clear instructions for combining multiple PDF documents.', to: '/guides/how-to-merge-pdf' },
  { label: 'PRIVACY', title: 'Is merging PDFs online safe?', body: 'Find out what browser-based PDF processing really means.', to: '/guides/is-online-pdf-merging-safe' },
  { label: 'TROUBLESHOOTING', title: 'Fix common PDF merging problems', body: 'Understand common PDF errors and practical ways to solve them.', to: '/guides/fix-pdf-merge-problems' }
]
</script>
<template>
  <main>
    <section class="relative overflow-hidden border-b border-slate-100 bg-[linear-gradient(180deg,#f4f8ff_0%,#fff_100%)]">
      <div class="site-container relative pb-16 pt-17 text-center sm:pb-21 sm:pt-24">
        <p class="mx-auto inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-brand shadow-sm">Simple PDF tools. No sign-up.</p>
        <h1 class="mx-auto mt-6 max-w-[850px] text-[clamp(2.7rem,6.3vw,4.65rem)] font-extrabold leading-[1.07] tracking-[-.06em] text-ink">Work with PDFs.<br /><span class="text-brand">Without the hassle.</span></h1>
        <p class="mx-auto mt-6 max-w-[660px] text-base leading-8 text-slate-600 sm:text-lg">Merge, split, rotate and organize your PDFs—or turn photos into one PDF. Fast, free and processed on your device.</p>
        <div class="mt-7 flex flex-wrap justify-center gap-3"><NuxtLink to="/tools" class="btn-primary px-7! py-3.5!">Explore all tools ↗</NuxtLink><NuxtLink to="/merge-pdf" class="btn-secondary px-7! py-3.5!">Merge PDF now</NuxtLink></div>
        <div class="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500"><span>✓ Free</span><span>✓ No account</span><span>✓ Browser-based processing</span></div>
      </div>
    </section>
    <section class="site-container pt-16 sm:pt-22" aria-label="All PDF tools">
      <div class="mx-auto max-w-[660px] text-center"><p class="eyebrow">Choose what you need</p><h2 class="mt-3 text-[clamp(1.85rem,3.8vw,2.7rem)] font-extrabold tracking-[-.045em] text-ink">All your PDF essentials</h2><p class="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Simple tools for documents, study notes, scans and everyday work.</p></div>
      <div class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="tool in pdfTools" :key="tool.to" :to="tool.to" class="group flex flex-col rounded-[18px] border border-slate-200 bg-white p-6 transition-colors hover:border-blue-300 hover:bg-[#fbfdff]">
          <div class="flex items-start justify-between"><span class="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-2xl font-bold text-brand">{{ tool.icon }}</span><span v-if="tool.tag" class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">{{ tool.tag }}</span></div>
          <h3 class="mt-5 text-lg font-extrabold text-ink group-hover:text-brand">{{ tool.name }}</h3><p class="mt-2 flex-1 text-sm leading-7 text-slate-600">{{ tool.desc }}</p><span class="mt-5 text-sm font-bold text-brand">Use tool →</span>
        </NuxtLink>
        <div class="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 p-6"><span class="grid h-12 w-12 place-items-center rounded-xl bg-white text-2xl text-slate-400">⇣</span><h3 class="mt-5 text-lg font-extrabold text-slate-600">Compress PDF <span class="ml-1 text-xs font-semibold text-slate-400">Coming later</span></h3><p class="mt-2 text-sm leading-7 text-slate-600">We are checking quality-safe compression methods before releasing this tool.</p></div>
      </div>
    </section>
    <section class="site-container pt-20 sm:pt-24">
      <div class="mx-auto max-w-[700px] text-center"><p class="eyebrow">Popular tool</p><h2 class="mt-3 text-[clamp(1.85rem,3.7vw,2.5rem)] font-extrabold tracking-[-.045em] text-ink">Merge your PDF files now</h2><p class="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Combine multiple documents right here. Reorder them before you download.</p></div>
      <div class="mx-auto mt-9 max-w-[950px]"><MergeWorkspace /></div>
    </section>
    <section class="site-container mt-20 sm:mt-26"><div class="rounded-[22px] border border-blue-100 bg-[#f8fbff] px-6 py-10 sm:px-10 sm:py-13"><div class="text-center"><p class="eyebrow">Designed to be easy</p><h2 class="mt-3 text-[clamp(1.8rem,3.5vw,2.45rem)] font-extrabold tracking-[-.045em] text-ink">Three simple steps</h2></div><ol class="mt-9 grid gap-4 md:grid-cols-3"><li v-for="step in steps" :key="step.number" class="rounded-2xl border border-slate-200 bg-white p-6"><span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-brand">{{ step.number }}</span><h3 class="mt-5 font-extrabold text-ink">{{ step.title }}</h3><p class="mt-2 text-sm leading-7 text-slate-600">{{ step.body }}</p></li></ol></div></section>
    <section class="site-container mt-20 sm:mt-26"><div class="flex flex-wrap items-end justify-between gap-4"><div><p class="eyebrow">PDF knowledge</p><h2 class="mt-3 text-[clamp(1.8rem,3.5vw,2.4rem)] font-extrabold tracking-[-.045em] text-ink">Useful guides & tips</h2></div><NuxtLink to="/guides" class="text-sm font-bold text-brand hover:underline">View all guides →</NuxtLink></div><div class="mt-7 grid gap-4 md:grid-cols-3"><NuxtLink v-for="guide in guides" :key="guide.to" :to="guide.to" class="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300"><p class="text-[11px] font-extrabold tracking-[.12em] text-brand">{{ guide.label }}</p><h3 class="mt-3 text-lg font-extrabold text-ink group-hover:text-brand">{{ guide.title }}</h3><p class="mt-3 flex-1 text-sm leading-7 text-slate-600">{{ guide.body }}</p><span class="mt-6 text-sm font-bold text-brand">Read guide →</span></NuxtLink></div></section>
  </main>
</template>
