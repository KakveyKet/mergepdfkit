<script setup>
import {
  Upload,
  PenLine,
  Download,
  ArrowRight,
  ShieldCheck,
} from "@lucide/vue";

usePageSeo({
  title: "Sign PDF Online Free | Add a Signature | PDFEasy",
  description:
    "Sign PDF documents online for free. Draw your " +
    "signature or upload an image, place it on a PDF " +
    "page and download the result. No signup required.",
  path: "/sign-pdf",
});

const steps = [
  {
    title: "Upload your PDF",
    description: "Choose the document you want to sign.",
    icon: Upload,
  },
  {
    title: "Create your signature",
    description: "Draw your signature or upload a PNG or JPG image.",
    icon: PenLine,
  },
  {
    title: "Place and download",
    description: "Move and resize the signature, then download your PDF.",
    icon: Download,
  },
];

const faqs = [
  {
    question: "Can I sign a PDF online for free?",
    answer:
      "Yes. PDFEasy lets you add a visible signature to a PDF without creating an account.",
  },
  {
    question: "Can I draw my signature?",
    answer: "Yes. Draw with your mouse, finger, touchpad or stylus.",
  },
  {
    question: "Can I use an existing signature image?",
    answer:
      "Yes. Upload a PNG or JPG image. Transparent PNG images usually produce the cleanest result.",
  },
  {
    question: "Can I choose the page and position?",
    answer:
      "Yes. Navigate to the PDF page, click where the signature should appear, then drag it to adjust its placement.",
  },
  {
    question: "Are my documents uploaded to a server?",
    answer:
      "No. PDFEasy processes the selected PDF and signature locally in your browser.",
  },
  {
    question: "Is this a legally verified digital signature?",
    answer:
      "No. This tool embeds a visual signature image. It does not verify identity or create a certificate-based digital signature.",
  },
];

const relatedTools = [
  {
    title: "Watermark PDF",
    description: "Add text or image watermarks.",
    to: "/watermark-pdf",
  },
  {
    title: "Add Page Numbers",
    description: "Number the pages of a PDF.",
    to: "/add-page-numbers",
  },
  {
    title: "Merge PDF",
    description: "Combine several PDFs into one file.",
    to: "/merge-pdf",
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
          class="mx-auto mt-5 text-[clamp(2.3rem,5vw,3.8rem)] font-extrabold tracking-[-.05em] text-slate-950"
        >
          Sign PDF
          <span class="text-blue-600">Online Free</span>
        </h1>

        <p
          class="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
        >
          Draw your signature or upload an image, place it anywhere on your PDF
          page, and download the updated document. Simple, private and free.
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

    <!-- SIGNATURE WORKSPACE -->
    <section class="site-container py-12 sm:py-16">
      <ClientOnly>
        <SignPdfWorkspace />

        <template #fallback>
          <div
            class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500"
          >
            Loading PDF signature editor...
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- HOW IT WORKS -->
    <section class="site-container py-14">
      <div class="text-center">
        <p class="eyebrow">Simple document signing</p>

        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
          How to add a signature to PDF
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

    <!-- FEATURES -->
    <section class="site-container py-14">
      <div class="rounded-3xl border border-blue-100 bg-[#f8fbff] p-7 sm:p-10">
        <div class="flex items-center gap-3">
          <ShieldCheck :size="28" class="text-blue-600" />

          <h2 class="text-2xl font-extrabold text-slate-950">
            Simple and private PDF signing
          </h2>
        </div>

        <div
          class="mt-7 grid gap-6 text-sm leading-7 text-slate-600 md:grid-cols-2"
        >
          <div>
            <h3 class="font-bold text-slate-900">Draw your signature</h3>

            <p class="mt-1">
              Use a mouse, finger or stylus to create a handwritten signature
              directly in the browser.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Upload a signature image</h3>

            <p class="mt-1">Use an existing PNG or JPG signature image.</p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">Flexible placement</h3>

            <p class="mt-1">
              Preview a page, drag the signature and adjust its size.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-slate-900">No document upload</h3>

            <p class="mt-1">
              Your document is processed locally without a remote PDF conversion
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
