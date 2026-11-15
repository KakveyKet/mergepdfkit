<script setup>
import {
  Upload,
  Settings2,
  Download,
  ArrowRight,
  ShieldCheck,
} from "@lucide/vue";

usePageSeo({
  title: "PDF to PNG Converter Online Free | PDFEasy",
  description:
    "Convert PDF pages to PNG images online for free. " +
    "Select pages, choose image resolution and download " +
    "PNG files or a ZIP. No signup required.",
  path: "/pdf-to-png",
});

const steps = [
  {
    title: "Upload a PDF",
    description:
      "Select the document containing the pages you want to convert.",
    icon: Upload,
  },
  {
    title: "Choose settings",
    description: "Select pages and choose your preferred PNG resolution.",
    icon: Settings2,
  },
  {
    title: "Download images",
    description: "Export one PNG image or a ZIP containing multiple pages.",
    icon: Download,
  },
];

const faqs = [
  {
    question: "Can I convert PDF to PNG for free?",
    answer:
      "Yes. PDFEasy converts PDF pages to PNG images for free without requiring an account.",
  },
  {
    question: "Can I convert only one PDF page?",
    answer:
      "Yes. Enter its page number, such as 3, and download that page as a PNG image.",
  },
  {
    question: "How can I convert multiple PDF pages?",
    answer:
      "Select all pages or enter a range such as 1-5. Multiple images are packaged into a ZIP download.",
  },
  {
    question: "What is the difference between PNG and JPG?",
    answer:
      "PNG uses lossless image compression, which is useful for text, screenshots and diagrams. JPG uses lossy compression and may create smaller files.",
  },
  {
    question: "Can I convert a PDF with more than 20 pages?",
    answer:
      "Yes, but this version exports a maximum of 20 selected pages per conversion. For longer documents, convert smaller page ranges.",
  },
  {
    question: "Are my files uploaded?",
    answer:
      "No. PDF pages are processed locally in your browser rather than uploaded to a PDF conversion server.",
  },
];

const relatedTools = [
  {
    title: "PDF to JPG",
    description: "Export PDF pages as JPG images.",
    to: "/pdf-to-jpg",
  },
  {
    title: "JPG to PDF",
    description: "Combine images into one PDF document.",
    to: "/jpg-to-pdf",
  },
  {
    title: "Organize PDF",
    description: "Reorder, rotate and remove PDF pages.",
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
        <p class="eyebrow">Free Online PDF Tool</p>

        <h1
          class="mx-auto mt-5 max-w-4xl text-[clamp(2.3rem,5vw,3.8rem)] font-extrabold tracking-[-.05em] text-slate-950"
        >
          Convert PDF to
          <span class="text-blue-600">PNG</span>
        </h1>

        <p
          class="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
        >
          Convert PDF pages into lossless PNG images. Choose your pages and
          resolution, then download the images for free. No installation
          required.
        </p>

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <span
            class="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Free
          </span>

          <span
            class="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
          >
            No signup
          </span>

          <span
            class="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Browser-based processing
          </span>
        </div>
      </div>
    </section>

    <!-- WORKSPACE -->
    <section class="site-container py-12 sm:py-16">
      <ClientOnly>
        <PdfToPngWorkspace />

        <template #fallback>
          <div
            class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
          >
            Loading PDF to PNG converter...
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- HOW TO CONVERT -->
    <section class="site-container py-14">
      <div class="text-center">
        <p class="eyebrow">PDF to PNG conversion</p>

        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          How to convert PDF to PNG
        </h2>
      </div>

      <div class="mt-9 grid gap-5 md:grid-cols-3">
        <article
          v-for="(step, index) in steps"
          :key="step.title"
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
          >
            <component :is="step.icon" :size="24" aria-hidden="true" />
          </div>

          <p class="mt-5 text-xs font-extrabold text-blue-600">
            STEP 0{{ index + 1 }}
          </p>

          <h3 class="mt-2 text-lg font-extrabold text-slate-900">
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
        <div class="flex items-center gap-3">
          <ShieldCheck
            :size="28"
            class="shrink-0 text-blue-600"
            aria-hidden="true"
          />

          <h2 class="text-2xl font-extrabold text-slate-950">
            Flexible and private PNG conversion
          </h2>
        </div>

        <div
          class="mt-7 grid gap-6 text-sm leading-7 text-slate-600 md:grid-cols-2"
        >
          <div>
            <h3 class="font-bold text-slate-900">Lossless PNG output</h3>

            <p class="mt-1">
              Export pages without JPG-style compression artifacts. The
              resulting images use a white background.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Select PDF pages</h3>

            <p class="mt-1">
              Convert the entire document or selected pages using a custom page
              range.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Flexible resolution</h3>

            <p class="mt-1">
              Choose standard, recommended or higher resolution based on your
              needs.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Local conversion</h3>

            <p class="mt-1">
              PDF content is converted on your device without uploading it to a
              conversion server.
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
            class="rounded-2xl border border-slate-200 bg-white p-5"
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
    <section class="site-container pb-20 pt-14">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-2xl font-extrabold text-slate-950">
          More free PDF tools
        </h2>

        <NuxtLink
          to="/tools"
          class="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
        >
          View all tools
          <ArrowRight :size="17" />
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

          <span
            class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600"
          >
            Open tool
            <ArrowRight :size="16" />
          </span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
