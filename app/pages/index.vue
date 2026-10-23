<script setup>
usePageSeo({
  title: 'PDFEasy — Free PDF Merger, Simple & Private',
  description: 'Merge PDF files online free. Reorder multiple PDF documents and download one file. Fast, private, and processed entirely in your browser.',
  path: '/'
})

const steps = [
  { number: '01', title: 'Choose your PDFs', body: 'Select two or more PDF documents from your device, or simply drag them into the tool.' },
  { number: '02', title: 'Arrange the order', body: 'Move documents up or down until the final PDF will have exactly the order you need.' },
  { number: '03', title: 'Merge and download', body: 'Combine your PDFs directly in the browser, then save the result in one click.' }
]
const features = [
  { title: 'Private by design', body: 'Your documents are merged locally in your browser. The files are not uploaded for server-side processing.', icon: 'shield' },
  { title: 'Simple file ordering', body: 'Add, remove, and rearrange your PDFs before creating the final document.', icon: 'sort' },
  { title: 'Free and straightforward', body: 'No sign-up, no complicated setup, and no software installation needed.', icon: 'spark' }
]
const guides = [
  { label: 'GETTING STARTED', title: 'How to merge PDF files in order', body: 'A clear step-by-step guide to combining multiple PDFs.', to: '/guides/how-to-merge-pdf' },
  { label: 'PRIVACY', title: 'Is merging PDFs online safe?', body: 'Learn how browser-based processing works and what to check.', to: '/guides/is-online-pdf-merging-safe' },
  { label: 'TROUBLESHOOTING', title: 'Fix common PDF merging problems', body: 'Learn what causes merging failures and how to solve them.', to: '/guides/fix-pdf-merge-problems' }
]
</script>

<template>
  <main>
    <section class="relative overflow-hidden border-b border-[#eef2f7] bg-[linear-gradient(180deg,#f8fbff_0%,#fff_100%)]">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_50%_0%,rgba(191,219,254,0.5),transparent_70%)]"></div>
      <div class="site-container relative pb-14 pt-16 text-center sm:pb-18 sm:pt-22">
        <div class="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white px-3.5 py-2 text-xs font-bold text-[#1d4ed8] shadow-sm shadow-blue-900/3">
          <span class="h-[7px] w-[7px] rounded-full bg-[#3b82f6]"></span> Free PDF tools for everyday work
        </div>
        <h1 class="mx-auto mt-6 max-w-[850px] text-[clamp(2.7rem,6.2vw,4.7rem)] font-extrabold leading-[1.08] tracking-[-.065em] text-ink">
          Merge PDF files.<br /><span class="text-brand">The easier way.</span>
        </h1>
        <p class="mx-auto mt-5 max-w-[620px] text-[15px] leading-8 text-[#64748b] sm:text-[17px]">
          Bring your documents together in seconds. Upload, organize, and download one PDF — all in your browser. No account required.
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span class="soft-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg> Free to use</span>
          <span class="soft-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg> No registration</span>
          <span class="soft-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg> Browser-based</span>
        </div>
      </div>
    </section>

    <section class="site-container mt-[-2px] max-w-[950px] pt-10 sm:pt-12" aria-label="Start merging your PDFs">
      <MergeWorkspace />
    </section>

    <section class="site-container pt-22 sm:pt-28">
      <div class="mx-auto max-w-[620px] text-center">
        <p class="eyebrow">Why choose PDFEasy</p>
        <h2 class="mt-3 text-[clamp(1.8rem,3.4vw,2.55rem)] font-extrabold leading-[1.15] tracking-[-.045em] text-ink">Everything you need to merge PDFs. Nothing extra.</h2>
        <p class="mt-4 text-sm leading-7 text-[#64748b] sm:text-base">Designed to keep document tasks simple, even when you're in a hurry.</p>
      </div>
      <div class="mt-10 grid gap-4 md:grid-cols-3">
        <article v-for="feature in features" :key="feature.title" class="rounded-[17px] border border-[#e2e8f0] bg-white p-6 sm:p-7">
          <div class="grid h-11 w-11 place-items-center rounded-xl bg-[#eff6ff] text-brand">
            <svg v-if="feature.icon === 'shield'" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 22 7-4V6l-7-4-7 4v12l7 4Z"/><path d="m9 12 2 2 4-4"/></svg>
            <svg v-else-if="feature.icon === 'sort'" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h12M4 17h8"/><path d="m15 16 3 3 3-3"/></svg>
            <svg v-else width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3Z"/><path d="m19 18 .5 1.5L21 20l-1.5.5L19 22l-.5-1.5L17 20l1.5-.5L19 18Z"/></svg>
          </div>
          <h3 class="mt-5 text-[17px] font-extrabold tracking-[-.02em] text-ink">{{ feature.title }}</h3>
          <p class="mt-2 text-sm leading-7 text-[#64748b]">{{ feature.body }}</p>
        </article>
      </div>
    </section>

    <section class="site-container mt-22 sm:mt-28">
      <div class="rounded-[22px] border border-[#e2e8f0] bg-[#f8fbff] px-6 py-10 sm:px-10 sm:py-13">
        <div class="text-center">
          <p class="eyebrow">A simple workflow</p>
          <h2 class="mt-3 text-[clamp(1.8rem,3.5vw,2.45rem)] font-extrabold tracking-[-.045em] text-ink">Three steps. One PDF.</h2>
        </div>
        <ol class="mt-9 grid gap-4 md:grid-cols-3">
          <li v-for="step in steps" :key="step.number" class="rounded-[16px] border border-[#e2e8f0] bg-white p-6">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#dbeafe] text-sm font-black text-brand">{{ step.number }}</span>
            <h3 class="mt-5 text-base font-extrabold text-ink">{{ step.title }}</h3>
            <p class="mt-2 text-sm leading-7 text-[#64748b]">{{ step.body }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="site-container mt-22 sm:mt-28">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow">Helpful resources</p>
          <h2 class="mt-3 text-[clamp(1.8rem,3.5vw,2.4rem)] font-extrabold tracking-[-.045em] text-ink">Learn more about PDFs</h2>
        </div>
        <NuxtLink to="/guides" class="text-sm font-bold text-brand hover:underline">Browse all PDF guides →</NuxtLink>
      </div>
      <div class="mt-7 grid gap-4 md:grid-cols-3">
        <NuxtLink v-for="guide in guides" :key="guide.to" :to="guide.to" class="group flex flex-col rounded-[17px] border border-[#e2e8f0] bg-white p-6 transition-colors hover:border-[#93c5fd]">
          <p class="text-[11px] font-extrabold tracking-[.13em] text-brand">{{ guide.label }}</p>
          <h3 class="mt-3 text-lg font-extrabold tracking-[-.02em] text-ink group-hover:text-brand">{{ guide.title }}</h3>
          <p class="mt-3 flex-1 text-sm leading-7 text-[#64748b]">{{ guide.body }}</p>
          <span class="mt-6 text-sm font-bold text-brand">Read article <span aria-hidden="true">↗</span></span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
