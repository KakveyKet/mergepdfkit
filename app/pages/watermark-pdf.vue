<script setup>
import {
  Upload,
  SlidersHorizontal,
  Download,
  ShieldCheck,
  ArrowRight,
} from "@lucide/vue";

usePageSeo({
  title: "Watermark PDF Online Free | Add Text or Image | PDFEasy",
  description:
    "Add text or image watermarks to PDF files online for free. " +
    "Customize position, opacity, rotation and page ranges. " +
    "No signup. Private browser-based processing.",
  path: "/watermark-pdf",
});

const steps = [
  {
    number: "01",
    title: "Upload PDF",
    description: "Choose the PDF document you want to watermark.",
    icon: Upload,
  },
  {
    number: "02",
    title: "Customize watermark",
    description:
      "Add text or an image and adjust its position, opacity and rotation.",
    icon: SlidersHorizontal,
  },
  {
    number: "03",
    title: "Download PDF",
    description: "Apply your watermark and download the updated document.",
    icon: Download,
  },
];

const faqs = [
  {
    question: "Can I watermark a PDF for free?",
    answer:
      "Yes. PDFEasy lets you add watermarks to PDF documents for free without creating an account.",
  },
  {
    question: "Can I add my company logo?",
    answer:
      "Yes. Upload a PNG or JPG logo, then choose its position, size, rotation and opacity.",
  },
  {
    question: "Can I watermark only selected pages?",
    answer:
      "Yes. Enter a page range such as 1-3,5 or 2- to apply the watermark only to those pages.",
  },
  {
    question: "Does PDFEasy upload my PDF?",
    answer:
      "No. Watermark processing happens locally in your browser. Your document is not uploaded to a PDF conversion server.",
  },
  {
    question: "Can I use a transparent image?",
    answer:
      "Yes. Transparent PNG files are supported and work especially well for logos.",
  },
  {
    question: "Can a watermark protect confidential information?",
    answer:
      "A visible watermark can identify or mark a document, but it is not encryption, access control or secure redaction.",
  },
];

const relatedTools = [
  {
    title: "Add Page Numbers",
    description: "Add page numbers to PDF documents.",
    to: "/add-page-numbers",
  },
  {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one.",
    to: "/merge-pdf",
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
          class="mx-auto mt-5 max-w-4xl text-[clamp(2.3rem,5vw,3.8rem)] font-extrabold leading-tight tracking-[-.05em] text-slate-950"
        >
          Add Watermark to
          <span class="text-blue-600"> PDF </span>
        </h1>

        <p
          class="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
        >
          Add text or image watermarks to your PDF documents. Customize
          position, opacity, rotation and selected pages. Free and processed in
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
            Private processing
          </span>
        </div>
      </div>
    </section>

    <!-- WATERMARK WORKSPACE -->
    <section class="site-container py-12 sm:py-16">
      <ClientOnly>
        <WatermarkWorkspace />

        <template #fallback>
          <div
            class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
          >
            Loading PDF watermark editor...
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- HOW TO USE -->
    <section class="site-container py-14">
      <div class="text-center">
        <p class="eyebrow">Easy PDF Watermarking</p>

        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          How to add a watermark to a PDF
        </h2>
      </div>

      <div class="mt-9 grid gap-5 md:grid-cols-3">
        <article
          v-for="step in steps"
          :key="step.number"
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
          >
            <component :is="step.icon" :size="23" />
          </div>

          <p class="mt-5 text-xs font-extrabold text-blue-600">
            STEP {{ step.number }}
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
          <ShieldCheck :size="28" class="text-blue-600" />

          <h2 class="text-2xl font-extrabold text-slate-950">
            Simple and private PDF watermarking
          </h2>
        </div>

        <div
          class="mt-7 grid gap-6 text-sm leading-7 text-slate-600 md:grid-cols-2"
        >
          <div>
            <h3 class="font-bold text-slate-900">Text watermarks</h3>

            <p class="mt-1">
              Add labels such as DRAFT, SAMPLE or CONFIDENTIAL to your
              documents.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Image watermarks</h3>

            <p class="mt-1">
              Add your logo or other PNG and JPG images with adjustable
              transparency.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Flexible placement</h3>

            <p class="mt-1">
              Choose from nine positions and adjust the watermark rotation.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Browser-based processing</h3>

            <p class="mt-1">
              The document is processed locally without sending it to a PDF
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
