<script setup>
import { Upload, Crop, Download, ShieldCheck, ArrowRight } from "@lucide/vue";

usePageSeo({
  title: "Crop PDF Online Free | Trim PDF Pages | PDFEasy",
  description:
    "Crop PDF pages online for free. Visually select an area, " +
    "remove unwanted margins, crop selected pages, and " +
    "download your PDF. No signup or file upload required.",
  path: "/crop-pdf",
});

const steps = [
  {
    title: "Upload your PDF",
    description: "Choose a PDF document from your device.",
    icon: Upload,
  },
  {
    title: "Select crop area",
    description:
      "Draw a rectangle around the area you want to keep. Adjust the margins and page range.",
    icon: Crop,
  },
  {
    title: "Download PDF",
    description: "Apply the crop and download your updated PDF document.",
    icon: Download,
  },
];

const faqs = [
  {
    question: "Can I crop a PDF online for free?",
    answer:
      "Yes. PDFEasy lets you crop PDF pages without creating an account or installing software.",
  },
  {
    question: "Can I crop multiple PDF pages?",
    answer:
      "Yes. Select all pages or enter a range such as 1-5 to apply the same proportional crop.",
  },
  {
    question: "Can I remove white margins?",
    answer:
      "Yes. Drag a rectangle around the content you want to keep or use the margin controls.",
  },
  {
    question: "Will cropping reduce the PDF quality?",
    answer:
      "The tool updates the PDF crop boundaries instead of converting pages into images, so the original text and graphics are preserved.",
  },
  {
    question: "Does cropping permanently remove hidden content?",
    answer:
      "No. Content outside the crop area remains in the underlying PDF. Use a proper redaction tool if information must be securely removed.",
  },
  {
    question: "Are my files uploaded?",
    answer:
      "No. The selected PDF is processed locally in your browser instead of being uploaded to a conversion server.",
  },
];

const relatedTools = [
  {
    title: "Organize PDF",
    description: "Reorder, rotate and remove PDF pages.",
    to: "/organize-pdf",
  },
  {
    title: "Rotate PDF",
    description: "Rotate PDF pages to the correct orientation.",
    to: "/rotate-pdf",
  },
  {
    title: "Compress PDF",
    description: "Try to reduce your PDF file size.",
    to: "/compress-pdf",
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
          Crop PDF
          <span class="text-blue-600"> Online Free </span>
        </h1>

        <p
          class="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
        >
          Trim unwanted margins and crop PDF pages with a visual editor. Select
          the area you want to keep and download your updated PDF. Simple,
          private, and free.
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
        <CropPdfWorkspace />

        <template #fallback>
          <div
            class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500"
          >
            Loading PDF crop editor...
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- HOW TO USE -->
    <section class="site-container py-14">
      <div class="text-center">
        <p class="eyebrow">Simple PDF cropping</p>

        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          How to crop a PDF
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
            <component :is="step.icon" :size="24" aria-hidden="true" />
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
      <div class="rounded-3xl border border-blue-100 bg-[#f8fbff] p-7 sm:p-10">
        <div class="flex items-center gap-3">
          <ShieldCheck :size="28" class="shrink-0 text-blue-600" />

          <h2 class="text-2xl font-extrabold text-slate-950">
            Flexible PDF cropping
          </h2>
        </div>

        <div
          class="mt-7 grid gap-6 text-sm leading-7 text-slate-600 md:grid-cols-2"
        >
          <div>
            <h3 class="font-bold text-slate-900">Visual crop selection</h3>

            <p class="mt-1">
              View your PDF page and draw a rectangle around the content you
              want to keep.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Adjust page margins</h3>

            <p class="mt-1">
              Fine-tune the crop by changing the top, bottom, left and right
              margins.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Crop selected pages</h3>

            <p class="mt-1">
              Apply the same crop to all pages or choose specific pages.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Preserve original quality</h3>

            <p class="mt-1">
              The PDF is not converted into images. Existing text and graphics
              are preserved.
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
