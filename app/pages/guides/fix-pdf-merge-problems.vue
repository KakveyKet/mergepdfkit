<script setup>
usePageSeo({ title: 'Why Won’t My PDFs Merge? Common Problems and Fixes | PDFEasy', description: 'Fix common PDF combining issues: encrypted files, corrupted PDFs, large documents, invalid extensions and browser memory.', path: '/guides/fix-pdf-merge-problems' })
</script>
<template>
  <main class="site-container max-w-[800px]! pt-14 sm:pt-20 prose-custom">
    <p class="eyebrow">PDF Guide · Troubleshooting</p>
    <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">Why won't my PDF files merge?</h1>
    <p>Most combining problems are caused by unsupported input files or device limitations. This guide explains common errors, what they mean, and practical steps to try without compromising your documents.</p>
    <h2>1. “This file is not a valid PDF”</h2>
    <p>A filename ending in .pdf does not guarantee that its contents are actually a PDF. Sometimes an image or document is renamed rather than exported. Open it in its original application and use an actual <strong>Export as PDF</strong> or <strong>Save as PDF</strong> option.</p>
    <h2>2. “Locked PDFs are not supported”</h2>
    <p>Some PDFs are encrypted or require a password to open. PDFEasy does not unlock protected files. If you own the document and have permission to make an unprotected copy, use the document's approved export workflow. Otherwise, request an appropriate copy from the file owner.</p>
    <h2>3. The browser slows down or stops</h2>
    <p>Combining PDFs uses memory on your device. Long scanned documents can require more memory than their file sizes suggest. Close unused browser tabs, try fewer PDFs at once, or use a device with more available memory. The current tool accepts up to 20 files, 30 MB each, and 100 MB combined; these limits are not a guarantee that every device can process that amount.</p>
    <h2>4. Some pages are missing or look different</h2>
    <p>Open the source PDFs and verify that they contain the pages you expect before merging. Forms, attachments embedded inside PDFs, annotations and interactive elements may not carry over in the same way as ordinary pages. Review the output before using it.</p>
    <h2>5. The download did not start</h2>
    <p>Your browser may block automatic downloads. If the merge completes, choose <strong>Download PDF again</strong> in the result message. If the browser requests permission to save a file, confirm it only after checking the displayed filename.</p>
    <h2>6. Digital signatures no longer validate</h2>
    <p>A digital signature normally authenticates the original PDF data. Building a new combined PDF can invalidate it. For signed contracts or records requiring legally valid signatures, follow the sender's prescribed document workflow instead of relying on a merged copy.</p>
    <h2>Still stuck?</h2>
    <p>Try merging two small PDFs to narrow down whether a particular document causes the error. You can <NuxtLink to="/contact">contact PDFEasy</NuxtLink> with the browser name, approximate file sizes, and error text. Please do not send confidential documents or their contents.</p>
    <p>Continue with <NuxtLink to="/guides/how-to-merge-pdf">the step-by-step guide</NuxtLink> or <NuxtLink to="/merge-pdf">try the merge tool again</NuxtLink>.</p>
  </main>
</template>
