<script setup>
usePageSeo({
  title: "PDFEasy — Free Online PDF Tools, Simple & Private",
  description:
    "Free PDF tools to merge, split, rotate, organize and convert " +
    "JPG images to PDFs. No signup, local browser processing.",
  path: "/",
});

// Homepage tool cards.
// Defined here to ensure all five tools always render.
const homepageTools = [
  {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document.",
    to: "/merge-pdf",
    icon: "merge",
    badge: "Popular",
  },
  {
    title: "Split PDF",
    description: "Extract the pages you need or split a file in two.",
    to: "/split-pdf",
    icon: "split",
    badge: "Free",
  },
  {
    title: "JPG to PDF",
    description: "Create a PDF from your JPG or PNG images.",
    to: "/jpg-to-pdf",
    icon: "image",
    badge: "Free",
  },
  {
    title: "Rotate PDF",
    description: "Turn individual pages or a whole PDF.",
    to: "/rotate-pdf",
    icon: "rotate",
    badge: "Free",
  },
  {
    title: "Organize PDF",
    description: "Reorder, rotate and remove document pages.",
    to: "/organize-pdf",
    icon: "organize",
    badge: "Free",
  },

  {
    title: "Add Page Numbers",
    description: "Add page numbers to your PDF with custom position and style.",
    to: "/add-page-numbers",
    icon: "numbers",
    badge: "New",
  },

  {
    title: "Watermark PDF",
    description: "Add text or image watermarks to your PDF documents.",
    to: "/watermark-pdf",
    icon: "watermark",
    badge: "New",
  },

  {
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images and download them easily.",
    to: "/pdf-to-jpg",
    icon: "pdf-to-jpg",
    badge: "New",
  },

  {
    title: "PDF to PNG",
    description:
      "Convert PDF pages into sharp PNG images and download them easily.",
    to: "/pdf-to-png",
    icon: "pdf-to-png",
    badge: "New",
  },

  {
    title: "Sign PDF",
    description:
      "Draw or upload your signature and place it on a PDF document.",
    to: "/sign-pdf",
    icon: "sign-pdf",
    badge: "New",
  },

  {
    title: "Compress PDF",
    description: "Reduce PDF file size with free browser-based compression.",
    to: "/compress-pdf",
    icon: "compress-pdf",
    badge: "New",
  },

  {
    title: "Crop PDF",
    description:
      "Crop PDF pages and trim unwanted margins with a visual editor.",
    to: "/crop-pdf",
    icon: "crop-pdf",
    badge: "New",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a tool",
    body:
      "Pick the PDF action you want—merge, split, " +
      "convert, rotate, or organize.",
  },
  {
    number: "02",
    title: "Select your files",
    body:
      "Choose a document or pictures from your " +
      "device and adjust the settings.",
  },
  {
    number: "03",
    title: "Download",
    body: "Create your updated PDF directly in the " + "browser and save it.",
  },
];

const guides = [
  {
    label: "GETTING STARTED",
    title: "How to merge PDF files in order",
    body: "Clear instructions for combining multiple " + "PDF documents.",
    to: "/guides/how-to-merge-pdf",
  },
  {
    label: "PRIVACY",
    title: "Is merging PDFs online safe?",
    body: "Find out what browser-based PDF processing " + "really means.",
    to: "/guides/is-online-pdf-merging-safe",
  },
  {
    label: "TROUBLESHOOTING",
    title: "Fix common PDF merging problems",
    body: "Understand common PDF errors and practical " + "ways to solve them.",
    to: "/guides/fix-pdf-merge-problems",
  },
];
</script>

<template>
  <main>
    <!-- ====================================== -->
    <!-- HERO SECTION -->
    <!-- ====================================== -->
    <section
      class="relative overflow-hidden border-b border-slate-100 bg-[linear-gradient(180deg,#f4f8ff_0%,#fff_100%)]"
    >
      <div
        class="site-container relative pb-16 pt-17 text-center sm:pb-21 sm:pt-24"
      >
        <p
          class="mx-auto inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-brand shadow-sm"
        >
          Simple PDF tools. No sign-up.
        </p>

        <h1
          class="mx-auto mt-6 max-w-[850px] text-[clamp(2.7rem,6.3vw,4.65rem)] font-extrabold leading-[1.07] tracking-[-.06em] text-ink"
        >
          Work with PDFs.
          <br />
          <span class="text-brand"> Without the hassle. </span>
        </h1>

        <p
          class="mx-auto mt-6 max-w-[660px] text-base leading-8 text-slate-600 sm:text-lg"
        >
          Merge, split, rotate and organize your PDFs—or turn photos into one
          PDF. Fast, free and processed on your device.
        </p>

        <div class="mt-7 flex flex-wrap justify-center gap-3">
          <NuxtLink to="/tools" class="btn-primary px-7! py-3.5!">
            Explore all tools ↗
          </NuxtLink>

          <NuxtLink to="/merge-pdf" class="btn-secondary px-7! py-3.5!">
            Merge PDF now
          </NuxtLink>
        </div>

        <div
          class="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500"
        >
          <span>✓ Free</span>
          <span>✓ No account</span>
          <span>✓ Browser-based processing</span>
        </div>
      </div>
    </section>

    <!-- ====================================== -->
    <!-- PDF TOOLS SECTION -->
    <!-- ====================================== -->
    <section class="site-container pt-16 sm:pt-22" aria-label="All PDF tools">
      <div class="mx-auto max-w-[660px] text-center">
        <p class="eyebrow">Choose what you need</p>

        <h2
          class="mt-3 text-[clamp(1.85rem,3.8vw,2.7rem)] font-extrabold tracking-[-.045em] text-ink"
        >
          All your PDF essentials
        </h2>

        <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          Simple tools for documents, study notes, scans and everyday work.
        </p>
      </div>

      <!-- ALL FIVE WORKING TOOLS -->
      <div class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="tool in homepageTools"
          :key="tool.to"
          :to="tool.to"
          class="group relative flex min-h-[270px] flex-col rounded-[24px] border border-slate-200 bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <div class="flex items-start justify-between gap-3">
            <!-- TOOL ICON -->
            <div
              class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="29"
                height="29"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <!-- Merge icon -->
                <template v-if="tool.icon === 'merge'">
                  <path d="M4 7h16" />
                  <path d="m8 3-4 4 4 4" />
                  <path d="M20 17H4" />
                  <path d="m16 13 4 4-4 4" />
                </template>

                <!-- Split icon -->
                <template v-else-if="tool.icon === 'split'">
                  <circle cx="6" cy="6" r="2" />
                  <circle cx="6" cy="18" r="2" />
                  <path d="M8 8l12 12" />
                  <path d="M8 16L20 4" />
                </template>

                <!-- Image icon -->
                <template v-else-if="tool.icon === 'image'">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </template>

                <!-- Rotate icon -->
                <template v-else-if="tool.icon === 'rotate'">
                  <path d="M3 11a9 9 0 1 1 3 7" />
                  <path d="M3 4v7h7" />
                </template>

                <!-- Organize icon -->
                <template v-else-if="tool.icon === 'organize'">
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path d="M9 7h6" />
                  <path d="M9 11h6" />
                  <path d="M9 15h6" />
                </template>

                <!-- Page numbers icon -->
                <template v-else-if="tool.icon === 'numbers'">
                  <path d="M5 5h2v10" />
                  <path d="M4 15h5" />
                  <path d="M13 7c2-2 5-1 5 1 0 2-5 4-5 7h6" />
                </template>

                <!-- Watermark PDF icon -->
                <template v-else-if="tool.icon === 'watermark'">
                  <path d="M9 10V6a3 3 0 0 1 6 0v4" />
                  <path d="M7 14h10a2 2 0 0 1 2 2v1H5v-1a2 2 0 0 1 2-2Z" />
                  <path d="M6 21h12" />
                </template>

                <template v-else-if="tool.icon === 'pdf-to-jpg'">
                  <rect x="3" y="3" width="14" height="18" rx="2" />
                  <path d="M7 8h6" />
                  <path d="M7 12h6" />
                  <path d="M18 13h3v8h-8v-3" />
                  <path d="m13 18 4-4" />
                </template>

                <template v-else-if="tool.icon === 'pdf-to-png'">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                  <path d="M16 4v5" />
                  <path d="m13.5 6.5 2.5 2.5 2.5-2.5" />
                </template>

                <template v-else-if="tool.icon === 'sign-pdf'">
                  <path d="M12 19h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
                </template>

                <template v-else-if="tool.icon === 'compress-pdf'">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M8 8l4 4" />
                  <path d="M8 11V8h3" />
                  <path d="M16 16l-4-4" />
                  <path d="M13 16h3v-3" />
                </template>

                <template v-else-if="tool.icon === 'crop-pdf'">
                  <path d="M6 3v12a3 3 0 0 0 3 3h12" />
                  <path d="M18 21V9a3 3 0 0 0-3-3H3" />
                </template>
              </svg>
            </div>

            <!-- BADGE -->
            <span
              class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
            >
              {{ tool.badge }}
            </span>
          </div>

          <!-- TOOL TITLE -->
          <h3
            class="mt-7 text-xl font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-blue-600"
          >
            {{ tool.title }}
          </h3>

          <!-- TOOL DESCRIPTION -->
          <p class="mt-3 flex-1 text-sm leading-7 text-slate-600">
            {{ tool.description }}
          </p>

          <!-- LINK -->
          <span
            class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600"
          >
            Use tool
            <span class="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- ====================================== -->
    <!-- ADSTERRA NATIVE BANNER -->
    <!-- ====================================== -->
    <section
      class="site-container mt-12 sm:mt-16"
      aria-label="Sponsored content"
    >
      <ClientOnly>
        <AdsterraNativeBanner />
      </ClientOnly>
    </section>

    <!-- ====================================== -->
    <!-- MERGE PDF WORKSPACE -->
    <!-- ====================================== -->
    <section class="site-container pt-20 sm:pt-24">
      <div class="mx-auto max-w-[700px] text-center">
        <p class="eyebrow">Popular tool</p>

        <h2
          class="mt-3 text-[clamp(1.85rem,3.7vw,2.5rem)] font-extrabold tracking-[-.045em] text-ink"
        >
          Merge your PDF files now
        </h2>

        <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          Combine multiple documents right here. Reorder them before you
          download.
        </p>
      </div>

      <div class="mx-auto mt-9 max-w-[950px]">
        <MergeWorkspace />
      </div>
    </section>

    <!-- ====================================== -->
    <!-- HOW IT WORKS -->
    <!-- ====================================== -->
    <section class="site-container mt-20 sm:mt-26">
      <div
        class="rounded-[22px] border border-blue-100 bg-[#f8fbff] px-6 py-10 sm:px-10 sm:py-13"
      >
        <div class="text-center">
          <p class="eyebrow">Designed to be easy</p>

          <h2
            class="mt-3 text-[clamp(1.8rem,3.5vw,2.45rem)] font-extrabold tracking-[-.045em] text-ink"
          >
            Three simple steps
          </h2>
        </div>

        <ol class="mt-9 grid gap-4 md:grid-cols-3">
          <li
            v-for="step in steps"
            :key="step.number"
            class="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <span
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-brand"
            >
              {{ step.number }}
            </span>

            <h3 class="mt-5 font-extrabold text-ink">
              {{ step.title }}
            </h3>

            <p class="mt-2 text-sm leading-7 text-slate-600">
              {{ step.body }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ====================================== -->
    <!-- PDF GUIDES -->
    <!-- ====================================== -->
    <section class="site-container mt-20 mb-20 sm:mt-26">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow">PDF knowledge</p>

          <h2
            class="mt-3 text-[clamp(1.8rem,3.5vw,2.4rem)] font-extrabold tracking-[-.045em] text-ink"
          >
            Useful guides & tips
          </h2>
        </div>

        <NuxtLink
          to="/guides"
          class="text-sm font-bold text-brand hover:underline"
        >
          View all guides →
        </NuxtLink>
      </div>

      <div class="mt-7 grid gap-4 md:grid-cols-3">
        <NuxtLink
          v-for="guide in guides"
          :key="guide.to"
          :to="guide.to"
          class="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300"
        >
          <p class="text-[11px] font-extrabold tracking-[.12em] text-brand">
            {{ guide.label }}
          </p>

          <h3
            class="mt-3 text-lg font-extrabold text-ink group-hover:text-brand"
          >
            {{ guide.title }}
          </h3>

          <p class="mt-3 flex-1 text-sm leading-7 text-slate-600">
            {{ guide.body }}
          </p>

          <span class="mt-6 text-sm font-bold text-brand"> Read guide → </span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
