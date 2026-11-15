<script setup>
import { Upload, Image, Download, ArrowRight, ShieldCheck } from "@lucide/vue";

usePageSeo({
  title: "PDF to JPG Converter Online Free | PDFEasy",
  description:
    "Convert PDF pages to JPG images online for free. " +
    "Select pages, image quality and resolution, then " +
    "download JPG files or a ZIP. No signup required.",
  path: "/pdf-to-jpg",
});

const steps = [
  {
    title: "Upload your PDF",
    description:
      "Select the PDF file containing the pages you want to convert.",
    icon: Upload,
  },
  {
    title: "Choose settings",
    description: "Select pages, JPG quality and image resolution.",
    icon: Image,
  },
  {
    title: "Download JPG",
    description: "Convert the document and download a JPG or ZIP of images.",
    icon: Download,
  },
];

const faqs = [
  {
    question: "Can I convert PDF to JPG for free?",
    answer:
      "Yes. PDFEasy converts PDF pages to JPG images for free without an account.",
  },
  {
    question: "Can I convert all PDF pages?",
    answer:
      "Yes, for documents with up to 40 pages. For longer documents, select a range of up to 40 pages per conversion.",
  },
  {
    question: "Can I convert only one PDF page?",
    answer:
      "Yes. Enter the page number, such as 3, and download that page as a JPG.",
  },
  {
    question: "Can I download multiple JPG images at once?",
    answer:
      "Yes. Multiple selected pages are packaged into one downloadable ZIP file.",
  },
  {
    question: "Are my PDF files uploaded to a server?",
    answer:
      "No. PDFEasy processes your selected document locally in your browser.",
  },
  {
    question: "Will the JPG preserve selectable PDF text?",
    answer:
      "No. A JPG is a raster image, so the original PDF text becomes part of the picture.",
  },
];

const relatedTools = [
  {
    title: "JPG to PDF",
    desc: "Combine JPG images into a PDF document.",
    to: "/jpg-to-pdf",
  },
  {
    title: "Merge PDF",
    desc: "Combine several PDF documents into one.",
    to: "/merge-pdf",
  },
  {
    title: "Watermark PDF",
    desc: "Add text or logo watermarks to PDF pages.",
    to: "/watermark-pdf",
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
          <span class="text-blue-600">JPG</span>
        </h1>

        <p
          class="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
        >
          Convert PDF pages into high-quality JPG images. Choose your page
          range, resolution and image quality. Free, simple and processed in
          your browser.
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
        <PdfToJpgWorkspace />

        <template #fallback>
          <div
            class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500"
          >
            Loading PDF to JPG converter...
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- HOW IT WORKS -->
    <section class="site-container py-14">
      <div class="text-center">
        <p class="eyebrow">Easy PDF Conversion</p>

        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          How to convert PDF to JPG
        </h2>
      </div>

      <div class="mt-9 grid gap-5 md:grid-cols-3">
        <article
          v-for="(step, index) in steps"
          :key="step.title"
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <span
            class="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-600"
          >
            <component :is="step.icon" :size="24" />
          </span>

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

    <!-- BENEFITS -->
    <section class="site-container py-14">
      <div
        class="rounded-[24px] border border-blue-100 bg-[#f8fbff] p-7 sm:p-10"
      >
        <div class="flex items-center gap-3">
          <ShieldCheck :size="28" class="text-blue-600" />

          <h2 class="text-2xl font-extrabold text-slate-950">
            Flexible, private PDF conversion
          </h2>
        </div>

        <div
          class="mt-7 grid gap-6 text-sm leading-7 text-slate-600 md:grid-cols-2"
        >
          <div>
            <h3 class="font-bold text-slate-900">Convert selected pages</h3>

            <p class="mt-1">
              Export one page or choose specific ranges instead of converting
              the whole document.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Adjustable JPG quality</h3>

            <p class="mt-1">
              Choose between standard, high and maximum image quality settings.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Download multiple images</h3>

            <p class="mt-1">
              Save several converted pages conveniently in one ZIP file.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">No document upload</h3>

            <p class="mt-1">
              PDF pages are converted on your device without a PDF processing
              server.
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
            {{ tool.desc }}
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
