<script setup>
import {
  Upload,
  SlidersHorizontal,
  Download,
  ArrowRight,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
} from "@lucide/vue";

usePageSeo({
  title: "Compress PDF Online Free | Reduce PDF Size | PDFEasy",
  description:
    "Compress PDF files online for free. Try text-preserving " +
    "optimization or image-based compression to reduce PDF " +
    "size. No signup or document upload required.",
  path: "/compress-pdf",
});

const steps = [
  {
    title: "Upload PDF",
    description: "Select the PDF document you want to compress.",
    icon: Upload,
  },
  {
    title: "Choose compression",
    description: "Choose text-preserving optimization or image compression.",
    icon: SlidersHorizontal,
  },
  {
    title: "Download",
    description:
      "Check the file-size comparison and download the smaller PDF if compression succeeded.",
    icon: Download,
  },
];

const features = [
  {
    title: "Text-preserving optimization",
    description:
      "Try structural PDF optimization without converting pages into images.",
    icon: FileText,
  },
  {
    title: "Image-based compression",
    description:
      "Rebuild PDF pages as compressed images when selectable text and interactive features are unnecessary.",
    icon: ImageIcon,
  },
  {
    title: "File size comparison",
    description:
      "Compare the original and processed PDF before downloading a smaller result.",
    icon: SlidersHorizontal,
  },
  {
    title: "Local processing",
    description:
      "Process your documents directly in the browser without sending them to a PDF conversion server.",
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    question: "Can I compress a PDF for free?",
    answer:
      "Yes. PDFEasy lets you attempt to compress a PDF for free without creating an account.",
  },
  {
    question: "Will my PDF always become smaller?",
    answer:
      "No. Some PDFs are already efficiently compressed. PDFEasy compares the original and processed sizes and only offers a compressed download if the result is smaller.",
  },
  {
    question: "Which compression mode should I choose?",
    answer:
      "Choose Preserve text when you need searchable text or vector graphics. Choose Image compression only when a page-image PDF is acceptable.",
  },
  {
    question: "Does image compression remove selectable text?",
    answer:
      "Yes. Image compression turns every page into an image. It also removes interactive PDF elements such as links and form fields.",
  },
  {
    question: "Can I compress a PDF larger than 30 pages?",
    answer:
      "The text-preserving optimization attempt supports larger documents within the 40 MB upload limit. Image compression is limited to 30 pages per PDF in this version.",
  },
  {
    question: "Can I compress a digitally signed PDF?",
    answer:
      "This tool is not recommended for digitally signed PDFs. Rewriting a PDF can invalidate its existing digital signatures.",
  },
  {
    question: "Are my PDF files uploaded?",
    answer:
      "No. PDFEasy performs this compression process locally in your browser instead of uploading your PDF to a compression server.",
  },
];

const relatedTools = [
  {
    title: "Merge PDF",
    description: "Combine several PDF documents into one.",
    to: "/merge-pdf",
  },
  {
    title: "Split PDF",
    description: "Extract pages or divide PDF documents.",
    to: "/split-pdf",
  },
  {
    title: "Organize PDF",
    description: "Reorder and remove PDF pages.",
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
          Compress PDF
          <span class="text-blue-600"> Online Free </span>
        </h1>

        <p
          class="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
        >
          Reduce PDF file size with browser-based compression. Choose a
          text-preserving optimization attempt or image compression, then
          compare the result before downloading.
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
            Browser-based
          </span>
        </div>
      </div>
    </section>

    <!-- COMPRESSION WORKSPACE -->
    <section class="site-container py-12 sm:py-16">
      <ClientOnly>
        <CompressPdfWorkspace />

        <template #fallback>
          <div
            class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
          >
            Loading PDF compressor...
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- STEPS -->
    <section class="site-container py-14">
      <div class="text-center">
        <p class="eyebrow">Easy PDF compression</p>

        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          How to compress a PDF
        </h2>
      </div>

      <div class="mt-9 grid gap-5 md:grid-cols-3">
        <article
          v-for="(step, index) in steps"
          :key="step.title"
          class="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div
            class="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-600"
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
      <div class="rounded-3xl border border-blue-100 bg-[#f8fbff] p-7 sm:p-10">
        <h2 class="text-2xl font-extrabold text-slate-950">
          Compress PDFs with more control
        </h2>

        <div class="mt-7 grid gap-6 md:grid-cols-2">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="flex items-start gap-3"
          >
            <span
              class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-600"
            >
              <component :is="feature.icon" :size="22" aria-hidden="true" />
            </span>

            <div>
              <h3 class="font-bold text-slate-900">
                {{ feature.title }}
              </h3>

              <p class="mt-2 text-sm leading-7 text-slate-600">
                {{ feature.description }}
              </p>
            </div>
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
