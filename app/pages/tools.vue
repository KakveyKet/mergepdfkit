<script setup>
import { computed } from "vue";

import {
  Files,
  Scissors,
  Image,
  RotateCw,
  Layers,
  ListOrdered,
  Stamp,
  Minimize2,
  FileText,
  ArrowRight,
  ShieldCheck,
  FileImage,
  Images,
  PenLine,
  Crop,
} from "@lucide/vue";

import { pdfTools } from "~/utils/toolCatalog.mjs";

usePageSeo({
  title: "Free PDF Tools — Merge, Split, Add Page Numbers & More | PDFEasy",
  description:
    "Free PDF tools to merge, split, rotate, organize, " +
    "convert JPG to PDF and add page numbers. " +
    "No signup. Browser-based PDF processing.",
  path: "/tools",
});

// Match each tool route to its Lucide icon.

const toolIcons = {
  "/merge-pdf": Files,
  "/split-pdf": Scissors,
  "/jpg-to-pdf": Image,
  "/rotate-pdf": RotateCw,
  "/organize-pdf": Layers,
  "/add-page-numbers": ListOrdered,

  // NEW
  "/watermark-pdf": Stamp,
  "/pdf-to-jpg": FileImage,
  "/pdf-to-png": Images,
  "/sign-pdf": PenLine,
  "/compress-pdf": Minimize2,
  "/crop-pdf": Crop,
};

// Ensure the new tool appears even if you
// haven't added it to toolCatalog.mjs yet.
const pageNumbersTool = {
  name: "Add Page Numbers",
  desc:
    "Add page numbers to PDF files. Choose their " +
    "position, starting number, font size and page range.",
  to: "/add-page-numbers",
  tag: "New",
};

const allTools = computed(() => {
  const existing = Array.isArray(pdfTools) ? pdfTools : [];

  if (existing.some((tool) => tool.to === pageNumbersTool.to)) {
    return existing;
  }

  return [...existing, pageNumbersTool];
});

function getToolIcon(tool) {
  return toolIcons[tool.to] || FileText;
}
</script>

<template>
  <main>
    <!-- HERO SECTION -->
    <section class="border-b border-slate-100 bg-[#f8fbff]">
      <div class="site-container py-16 text-center sm:py-20">
        <p class="eyebrow">Everything in one place</p>

        <h1
          class="mt-3 text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-.05em] text-ink"
        >
          Free PDF tools, made simple.
        </h1>

        <p
          class="mx-auto mt-4 max-w-[600px] text-base leading-8 text-slate-600"
        >
          Work with PDFs in a few clicks. Your documents are processed in your
          browser, not sent to a conversion server.
        </p>

        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span
            class="rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Free tools
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

    <!-- ALL PDF TOOLS -->
    <section
      class="site-container pb-16 pt-12 sm:pb-24 sm:pt-16"
      aria-label="All PDF tools"
    >
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold tracking-tight text-ink">
            Explore PDF Tools
          </h2>

          <p class="mt-2 text-sm text-slate-600">
            Choose the tool you need to get started.
          </p>
        </div>

        <span
          class="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-brand"
        >
          {{ allTools.length }} Free Tools
        </span>
      </div>

      <!-- TOOL CARDS -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="tool in allTools"
          :key="tool.to"
          :to="tool.to"
          class="group flex min-h-[250px] flex-col rounded-[18px] border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <!-- ICON AND TAG -->
          <div class="flex items-start justify-between gap-3">
            <span
              class="grid h-14 w-14 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100"
            >
              <component
                :is="getToolIcon(tool)"
                :size="27"
                :stroke-width="1.8"
                aria-hidden="true"
              />
            </span>

            <span
              v-if="tool.tag"
              class="rounded-full px-3 py-1 text-[11px] font-bold"
              :class="
                tool.tag === 'New'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              "
            >
              {{ tool.tag }}
            </span>
          </div>

          <!-- TOOL NAME -->
          <h3
            class="mt-5 text-xl font-extrabold tracking-tight text-ink transition-colors group-hover:text-brand"
          >
            {{ tool.name }}
          </h3>

          <!-- TOOL DESCRIPTION -->
          <p class="mt-2 flex-1 text-sm leading-7 text-slate-600">
            {{ tool.desc }}
          </p>

          <!-- OPEN TOOL -->
          <span
            class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand"
          >
            Open tool

            <ArrowRight
              :size="17"
              class="transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </NuxtLink>
      </div>

      <!-- PRIVACY INFORMATION -->
      <div
        class="mt-12 rounded-2xl border border-blue-100 bg-blue-50 px-6 py-8 sm:px-9"
      >
        <div class="flex items-start gap-4">
          <span
            class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-blue-600"
          >
            <ShieldCheck :size="25" :stroke-width="1.8" aria-hidden="true" />
          </span>

          <div>
            <h2 class="text-xl font-extrabold text-ink">
              What happens to my files?
            </h2>

            <p class="mt-2 max-w-[780px] text-sm leading-7 text-slate-600">
              PDFEasy performs these document operations locally in your
              browser. The source PDFs and images do not need to be uploaded to
              a PDF processing server. Website assets and optional analytics or
              advertisements may still involve network requests. Read our

              <NuxtLink
                to="/privacy-policy"
                class="font-bold text-brand underline"
              >
                Privacy Policy
              </NuxtLink>

              for details.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
