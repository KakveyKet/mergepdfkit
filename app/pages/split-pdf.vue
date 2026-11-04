<script setup>
import { ref, onBeforeUnmount } from "vue";
import { formatBytes } from "~/utils/files.mjs";
import {
  parsePageSelection,
  createDownload,
  triggerDownload,
  revokeDownloads,
  sanitizePdfFilename,
} from "~/utils/pdf-toolkit.mjs";

usePageSeo({
  title: "Split PDF Online Free | Extract Pages | PDFEasy",
  description:
    "Split PDF files online for free. Extract the pages " +
    "you need and download your PDF in a few simple " +
    "steps. No sign-up or software installation required.",
  path: "/split-pdf",
});

const selected = ref(null);
const error = ref("");
const progress = ref("");
const busy = ref(false);
const mode = ref("extract");
const pageRanges = ref("1");
const splitAfter = ref(1);
const filename = ref("selected-pages.pdf");
const downloads = ref([]);
function resetResult() {
  revokeDownloads(downloads.value);
  downloads.value = [];
  progress.value = "";
}
onBeforeUnmount(resetResult);
function onSelected(value) {
  selected.value = value;
  error.value = "";
  resetResult();
  pageRanges.value =
    value.pageCount > 1 ? `1-${Math.min(value.pageCount, 2)}` : "1";
  splitAfter.value = 1;
}
function onError(message) {
  error.value = message;
}
async function run() {
  if (!selected.value || busy.value) return;
  resetResult();
  error.value = "";
  busy.value = true;
  progress.value = "Preparing your PDF…";
  try {
    const { PDFDocument } = await import("pdf-lib");
    const input = await PDFDocument.load(
      await selected.value.file.arrayBuffer(),
      { updateMetadata: false },
    );
    const count = input.getPageCount();
    const exports = [];
    if (mode.value === "extract") {
      const indexes = parsePageSelection(pageRanges.value, count);
      const pdf = await PDFDocument.create();
      for (const page of await pdf.copyPages(input, indexes)) pdf.addPage(page);
      exports.push(
        createDownload(
          await pdf.save({ useObjectStreams: true }),
          sanitizePdfFilename(filename.value, "selected-pages"),
        ),
      );
    } else {
      const cut = Number(splitAfter.value);
      if (!Number.isInteger(cut) || cut < 1 || cut >= count)
        throw new Error(`Choose a split point from 1 to ${count - 1}.`);
      const groups = [
        Array.from({ length: cut }, (_, i) => i),
        Array.from({ length: count - cut }, (_, i) => i + cut),
      ];
      for (const [i, group] of groups.entries()) {
        const pdf = await PDFDocument.create();
        for (const page of await pdf.copyPages(input, group)) pdf.addPage(page);
        exports.push(
          createDownload(
            await pdf.save({ useObjectStreams: true }),
            `split-part-${i + 1}.pdf`,
          ),
        );
      }
    }
    downloads.value = exports;
    progress.value = `Done. ${exports.length} PDF file${exports.length > 1 ? "s" : ""} created.`;
    // Multiple browser downloads may require explicit user clicks; keep each accessible.
    if (exports.length === 1) triggerDownload(exports[0]);
  } catch (e) {
    error.value = e.message || "Could not split this PDF.";
    progress.value = "";
  } finally {
    busy.value = false;
  }
}
const faqs = [
  [
    "Do I need to upload my PDF?",
    "No. PDFEasy processes your file locally in your browser.",
  ],
  [
    "Can I extract pages like 1, 3-5?",
    "Yes. Enter individual pages and ranges separated by commas.",
  ],
  [
    "Can I split into two files?",
    "Yes. Select Split into two files, then choose the page after which to split.",
  ],
  [
    "Will digital signatures survive?",
    "Editing or copying PDF pages may invalidate signatures or alter interactive features. Always check the result.",
  ],
];
</script>
<template>
  <ToolLayout
    eyebrow="Extract or divide pages"
    title="Split PDF online"
    description="Keep just the pages you need, or split one PDF into two documents. Simple, free and private."
    :steps="[
      'Select a PDF from your device.',
      'Choose pages to extract or a split point.',
      'Click Create PDF files, then download your results.',
    ]"
    note="This tool accepts standard PDFs without passwords. Copied pages may lose some interactive features or signatures."
    :faqs="faqs"
    :related="[
      { label: 'Merge PDF', to: '/merge-pdf' },
      { label: 'Organize PDF', to: '/organize-pdf' },
    ]"
  >
    <div class="surface-card p-5 sm:p-8">
      <SinglePdfSelect
        :disabled="busy"
        @selected="onSelected"
        @error="onError"
      />
      <div v-if="selected" class="mt-6">
        <div class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <strong class="break-all">{{ selected.file.name }}</strong> ·
          {{ selected.pageCount }} pages · {{ formatBytes(selected.file.size) }}
        </div>
        <fieldset class="mt-6">
          <legend class="text-sm font-bold text-ink">
            What would you like to do?
          </legend>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <label
              class="flex cursor-pointer gap-3 rounded-xl border p-4 text-sm"
              :class="
                mode === 'extract'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200'
              "
              ><input
                v-model="mode"
                type="radio"
                name="splitMode"
                value="extract"
                :disabled="busy"
              />
              Extract selected pages</label
            >
            <label
              class="flex cursor-pointer gap-3 rounded-xl border p-4 text-sm"
              :class="
                mode === 'two'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200'
              "
              ><input
                v-model="mode"
                type="radio"
                name="splitMode"
                value="two"
                :disabled="busy || selected.pageCount < 2"
              />
              Split into two PDFs</label
            >
          </div>
        </fieldset>
        <div v-if="mode === 'extract'" class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="block text-sm font-semibold text-ink"
            >Pages to extract
            <span class="mt-1 block text-xs font-normal text-slate-500"
              >Example: 1, 3-5, 8</span
            ><input
              v-model="pageRanges"
              type="text"
              class="tool-input mt-2"
              placeholder="1, 3-5"
              :disabled="busy"
          /></label>
          <label class="block text-sm font-semibold text-ink"
            >Output filename<input
              v-model="filename"
              type="text"
              maxlength="100"
              class="tool-input mt-2"
              :disabled="busy"
          /></label>
        </div>
        <div v-else class="mt-5">
          <label class="block text-sm font-semibold text-ink"
            >Split after page<input
              v-model.number="splitAfter"
              type="number"
              min="1"
              :max="selected.pageCount - 1"
              class="tool-input mt-2 max-w-48"
              :disabled="busy"
          /></label>
          <p class="mt-2 text-sm text-slate-600">
            Part 1 will contain pages 1–{{ splitAfter }} and part 2 will contain
            the remaining pages.
          </p>
        </div>
        <button
          type="button"
          class="btn-primary mt-6 w-full sm:w-auto"
          :disabled="busy || (mode === 'two' && selected.pageCount < 2)"
          @click="run"
        >
          {{ busy ? "Processing…" : "Create PDF files" }}
        </button>
      </div>
      <p v-if="progress" role="status" class="mt-4 text-sm text-slate-600">
        {{ progress }}
      </p>
      <p
        v-if="error"
        role="alert"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      >
        {{ error }}
      </p>
      <PdfDownloadResults :items="downloads" />
    </div>
    <template #article
      ><h2>Two ways to split your document</h2>
      <p>
        Use <strong>Extract selected pages</strong> when you need a particular
        chapter, receipt, or handout from a longer PDF. Page ranges such as 2-4
        keep those pages together in a single downloadable PDF. Choose
        <strong>Split into two PDFs</strong> when dividing a document at a
        specific page boundary, for example separating a report from its
        appendix.
      </p>
      <p>
        If you enter pages out of order, the extraction follows the order you
        enter. Duplicate page numbers are included only once.
      </p></template
    >
  </ToolLayout>
</template>
