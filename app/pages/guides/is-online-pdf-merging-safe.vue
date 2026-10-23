<script setup>
usePageSeo({ title:'Is It Safe to Merge PDF Files Online? | PDFEasy', description:'Understand server-based and browser-based PDF merging, practical document privacy checks, and when not to use an online PDF tool.', path:'/guides/is-online-pdf-merging-safe' })
</script>
<template>
  <main class="site-container max-w-[800px]! pt-14 sm:pt-20 prose-custom">
    <p class="text-brand! font-extrabold text-xs uppercase tracking-[.18em]">PDF Guide · Privacy</p>
    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">Is it safe to merge PDF files online?</h1>
    <p>People often merge PDFs for school, work, travel, or personal organization. Some files are harmless to share; others contain confidential information. Before using a website to combine PDFs, it is useful to understand exactly where the file processing happens.</p>
    <h2>Two common ways PDF websites work</h2>
    <h3>Server-based processing</h3>
    <p>A server-based document service uploads your selected PDFs to the service's infrastructure. It creates the combined document on the server and returns a download. This approach can support large documents or complex transformations, but it also means the source files leave your device. Before uploading private data, you need to understand the provider's security, retention, and deletion practices.</p>
    <h3>Browser-based processing</h3>
    <p>A browser-based tool loads a software library as part of the website and processes the PDF content on your device. It can combine pages without transferring those PDFs to an application server. This is how PDFEasy's Merge PDF feature is designed: its JavaScript code reads your local files and creates the merged PDF in memory.</p>
    <p>Browser-only processing does not mean all privacy risks disappear. Your browser still loads the web page and scripts from a host. Network access, browser extensions, malware, shared computers, and changes to a website's code are separate concerns. Always use trusted sites and maintain your device's security.</p>
    <h2>How to evaluate an online PDF tool</h2>
    <ul>
      <li><strong>Find the privacy policy.</strong> Look for a plain explanation of whether files are uploaded and how long the service stores them.</li>
      <li><strong>Check for HTTPS.</strong> HTTPS protects communication with the website host, but does not by itself prove what happens to uploaded files.</li>
      <li><strong>Review permissions.</strong> Only upload or merge files that you are allowed to process in that environment.</li>
      <li><strong>Beware of misleading download controls.</strong> Use the actual tool button, not advertisements that resemble application actions.</li>
      <li><strong>Inspect the output.</strong> Merging can affect digital signatures and advanced interactive PDF features, even when all visible pages appear.</li>
    </ul>
    <h2>When should you avoid a web-based tool?</h2>
    <p>For medical records, financial statements, confidential client material, identity documents, or data governed by workplace rules, follow the policies of the person or organization responsible for the files. A company may require approved software regardless of whether a website claims to process content locally.</p>
    <p>If a document has a digital signature that must remain valid, creating a new combined PDF may be the wrong approach. Ask the recipient how the records should be packaged or use an approved secure document workflow.</p>
    <h2>What PDFEasy currently does</h2>
    <p>The PDFEasy merge feature uses the open-source pdf-lib library in the browser. Selected files are not uploaded by the merge feature. The website has practical processing limits because browsers have finite memory. Password-protected PDF input is not supported.</p>
    <p>This project ships with advertising disabled by default. Site ownership can be verified through an AdSense meta tag without installing the advertising script. If advertising or analytics scripts are later enabled, review the privacy policy and any required consent controls.</p>
    <p>You can review the <NuxtLink to="/privacy-policy">PDFEasy privacy policy</NuxtLink> or learn <NuxtLink to="/guides/how-to-merge-pdf">how to merge PDFs step by step</NuxtLink>.</p>
  </main>
</template>
