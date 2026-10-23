<script setup>
usePageSeo({
  title: 'Merge PDF Files Online Free — Private PDF Combiner | PDFEasy',
  description: 'Merge multiple PDF documents into one file for free. Rearrange PDFs and download instantly. Your files stay in your browser.',
  path: '/merge-pdf'
})

const questions = [
  ['Is PDFEasy free?', 'Yes. This PDF merge tool is free to use and does not require an account.'],
  ['Are my PDFs uploaded to a server?', 'No. The merger reads and combines PDF files locally in your browser, rather than uploading them for server-side processing.'],
  ['Can I rearrange documents?', 'Yes. Drag a document to a new position, or use its up and down arrows. The combined PDF follows the order shown in your file list.'],
  ['Can I merge password-protected PDFs?', 'Not in this version. You need an unlocked PDF that you have permission to use.'],
  ['What is the file-size limit?', 'You can select up to 20 PDF files, up to 30 MB each and 100 MB total, to reduce memory problems on different devices.'],
  ['Will all interactive elements still work?', 'Some forms, annotations, and digital signatures may not survive the page-copying process as expected. Always review important merged documents before sharing them.']
]
</script>

<template>
  <main>
    <section class="border-b border-[#eef2f7] bg-[linear-gradient(180deg,#f8fbff,#fff)]">
      <div class="site-container pb-11 pt-12 text-center sm:pb-13 sm:pt-17">
        <p class="eyebrow">Free online PDF merger</p>
        <h1 class="mx-auto mt-3 max-w-[760px] text-[clamp(2.3rem,5vw,3.7rem)] font-extrabold leading-[1.12] tracking-[-.055em] text-ink">Merge PDF files online</h1>
        <p class="mx-auto mt-4 max-w-[610px] text-[15px] leading-8 text-[#64748b] sm:text-base">Combine multiple documents into a single PDF, in the order you choose. No uploads or registration needed.</p>
      </div>
    </section>

    <div class="site-container max-w-[950px] pt-10"><MergeWorkspace /></div>

    <div class="site-container max-w-[880px] pt-20 sm:pt-24">
      <section class="prose-custom">
        <p class="eyebrow">Step-by-step</p>
        <h2>How to merge PDF files</h2>
        <ol>
          <li><strong>Select your PDFs.</strong> Choose at least two documents from your device or drop files into the merge workspace.</li>
          <li><strong>Review the order.</strong> Check filenames and page counts. Use drag-and-drop or the move buttons to organize the list.</li>
          <li><strong>Merge and download.</strong> Click the Merge & download button. Your browser will build one combined file using the filename you choose.</li>
          <li><strong>Check your document.</strong> Open the finished PDF to verify its pages before sharing it with others.</li>
        </ol>
        <h2>Why combine PDF documents?</h2>
        <p>Keeping related documents together makes them easier to send, review, and archive. For example, you can combine a report and its appendices, class notes from different days, or multiple receipts for your own records.</p>
        <p>PDFEasy processes documents in your browser instead of sending the files to a document processing server. This offers more control over your files, though you should still follow your organization's information-security policies and keep your device secure.</p>
        <h2>Important limitations</h2>
        <p>This version supports standard unencrypted PDFs. It cannot unlock password-protected documents or repair corrupted files. Copying pages can affect forms, annotations, or digital signatures, so always check an important output before relying on it.</p>
      </section>

      <section class="mt-15">
        <p class="eyebrow">FAQs</p>
        <h2 class="mt-3 text-3xl font-extrabold tracking-[-.04em] text-ink">Common questions</h2>
        <div class="mt-6 space-y-3">
          <details v-for="item in questions" :key="item[0]" class="group rounded-[13px] border border-[#e2e8f0] bg-white px-5 py-4 open:border-[#bfdbfe]">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#0f172a] [&::-webkit-details-marker]:hidden">
              {{ item[0] }}
              <span class="text-lg font-normal text-brand transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p class="mt-3 max-w-[700px] text-sm leading-7 text-[#64748b]">{{ item[1] }}</p>
          </details>
        </div>
        <p class="mt-7 text-sm leading-7 text-[#64748b]">See also our <NuxtLink to="/guides/how-to-merge-pdf" class="font-bold text-brand underline underline-offset-3">complete PDF merging guide</NuxtLink> and <NuxtLink to="/guides/is-online-pdf-merging-safe" class="font-bold text-brand underline underline-offset-3">privacy explainer</NuxtLink>. More help is available in the <NuxtLink to="/guides" class="font-bold text-brand underline underline-offset-3">PDF guides library</NuxtLink>.</p>
      </section>
    </div>
  </main>
</template>
