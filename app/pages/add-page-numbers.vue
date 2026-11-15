<script setup>
usePageSeo({
  title: "Add Page Numbers to PDF Online Free | PDFEasy",
  description:
    "Add page numbers to PDF files online for free. " +
    "Choose position, starting number, font size, color, " +
    "and page range. No signup or upload required.",
  path: "/add-page-numbers",
});

const steps = [
  {
    number: "01",
    title: "Upload a PDF",
    description: "Choose the PDF file you want to number.",
  },
  {
    number: "02",
    title: "Choose settings",
    description:
      "Select the position, page range, number format, " +
      "and starting number.",
  },
  {
    number: "03",
    title: "Download",
    description: "Apply page numbers and download your updated PDF.",
  },
];

const faqs = [
  {
    question: "Can I add page numbers to a PDF for free?",
    answer:
      "Yes. PDFEasy lets you add page numbers online " +
      "for free without creating an account.",
  },
  {
    question: "Can I skip the first page?",
    answer:
      "Yes. Enter 2- in the page range field. " +
      "This adds numbers from the second page onward.",
  },
  {
    question: "Can I change where the numbers appear?",
    answer:
      "Yes. Choose top or bottom placement, " +
      "then align numbers to the left, center, or right.",
  },
  {
    question: "Does PDFEasy upload my document?",
    answer:
      "No. Page numbering runs locally in your browser. " +
      "Your PDF file is not uploaded to our server for processing.",
  },
  {
    question: "Can I choose the starting number?",
    answer: "Yes. Set any starting number from 1 to 100000.",
  },
];

const relatedTools = [
  {
    title: "Merge PDF",
    description: "Combine several documents into one PDF.",
    to: "/merge-pdf",
  },
  {
    title: "Split PDF",
    description: "Extract the pages you need.",
    to: "/split-pdf",
  },
  {
    title: "Organize PDF",
    description: "Reorder or remove PDF pages.",
    to: "/organize-pdf",
  },
];
</script>

<template>
  <main>
    <!-- HERO -->
    <section
      class="border-b border-slate-100 bg-[linear-gradient(180deg,#f4f8ff_0%,#fff_100%)]"
    >
      <div class="site-container py-14 text-center sm:py-20">
        <div
          class="mx-auto inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-blue-600 shadow-sm"
        >
          Free Online PDF Tool
        </div>

        <h1
          class="mx-auto mt-6 max-w-4xl text-[clamp(2.25rem,5vw,3.8rem)] font-extrabold leading-tight tracking-tight text-slate-950"
        >
          Add Page Numbers to
          <span class="text-blue-600"> PDF</span>
        </h1>

        <p
          class="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
        >
          Number PDF pages in seconds. Choose the position, starting number,
          font size, and pages you want. Free, simple, and processed in your
          browser.
        </p>

        <div
          class="mt-6 flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-500"
        >
          <span>✓ Free</span>
          <span>✓ No signup</span>
          <span>✓ No file upload</span>
          <span>✓ Custom page ranges</span>
        </div>
      </div>
    </section>

    <!-- PDF WORKSPACE -->
    <section class="site-container py-12 sm:py-16">
      <ClientOnly>
        <PageNumbersWorkspace />

        <template #fallback>
          <div
            class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500"
          >
            Loading PDF editor...
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- HOW TO USE -->
    <section class="site-container py-14">
      <div class="text-center">
        <p class="eyebrow">Easy PDF numbering</p>

        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          How to add page numbers to a PDF
        </h2>
      </div>

      <div class="mt-9 grid gap-5 md:grid-cols-3">
        <article
          v-for="step in steps"
          :key="step.number"
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <span
            class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 font-extrabold text-blue-600"
          >
            {{ step.number }}
          </span>

          <h3 class="mt-5 text-lg font-bold text-slate-900">
            {{ step.title }}
          </h3>

          <p class="mt-3 text-sm leading-7 text-slate-600">
            {{ step.description }}
          </p>
        </article>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="site-container py-14">
      <div
        class="rounded-[24px] border border-blue-100 bg-[#f8fbff] p-7 sm:p-10"
      >
        <h2 class="text-2xl font-extrabold text-slate-900">
          Customize page numbers your way
        </h2>

        <div
          class="mt-6 grid gap-6 text-sm leading-7 text-slate-600 md:grid-cols-2"
        >
          <div>
            <h3 class="font-bold text-slate-900">Choose specific pages</h3>
            <p class="mt-1">
              Number all pages, select a range, or leave the cover page
              unnumbered.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Change number placement</h3>
            <p class="mt-1">
              Place numbers at the top or bottom, aligned to the left, center,
              or right.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Control number appearance</h3>
            <p class="mt-1">
              Choose a number format, starting number, font size, margin, and
              text color.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Browser-based processing</h3>
            <p class="mt-1">
              Files are processed on your device without uploading them for page
              numbering.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="site-container py-14">
      <div class="mx-auto max-w-3xl">
        <h2
          class="text-center text-3xl font-extrabold tracking-tight text-slate-950"
        >
          Frequently asked questions
        </h2>

        <div class="mt-8 space-y-4">
          <details
            v-for="item in faqs"
            :key="item.question"
            class="group rounded-2xl border border-slate-200 bg-white p-5"
          >
            <summary class="cursor-pointer font-bold text-slate-900">
              {{ item.question }}
            </summary>

            <p class="mt-4 text-sm leading-7 text-slate-600">
              {{ item.answer }}
            </p>
          </details>
        </div>
      </div>
    </section>

    <!-- RELATED TOOLS -->
    <section class="site-container py-14">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-2xl font-extrabold text-slate-950">
          More free PDF tools
        </h2>

        <NuxtLink
          to="/tools"
          class="text-sm font-bold text-blue-600 hover:underline"
        >
          View all tools →
        </NuxtLink>
      </div>

      <div class="mt-6 grid gap-5 md:grid-cols-3">
        <NuxtLink
          v-for="tool in relatedTools"
          :key="tool.to"
          :to="tool.to"
          class="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm"
        >
          <h3
            class="text-lg font-extrabold text-slate-900 group-hover:text-blue-600"
          >
            {{ tool.title }}
          </h3>

          <p class="mt-2 text-sm leading-7 text-slate-600">
            {{ tool.description }}
          </p>

          <span class="mt-5 inline-block text-sm font-bold text-blue-600">
            Use tool →
          </span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
