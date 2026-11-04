<script setup>
import { ref, onBeforeUnmount, computed } from "vue";
import { formatBytes } from "~/utils/files.mjs";
import {
  moveIndexed,
  normalizedRotation,
  createDownload,
  triggerDownload,
  revokeDownloads,
} from "~/utils/pdf-toolkit.mjs";

usePageSeo({
  title: "Organize PDF Pages Online Free | PDFEasy",
  description:
    "Organize PDF pages online for free. Reorder, " +
    "rotate and remove pages to arrange your PDF " +
    "document the way you want. Download easily.",
  path: "/organize-pdf",
});
const selected = ref(null),
  pages = ref([]),
  busy = ref(false),
  error = ref(""),
  name = ref("organized.pdf"),
  downloads = ref([]);
const dragged = ref(-1);
const kept = computed(() => pages.value.length);
const MAX_ORGANIZE_PAGES = 150;
function resetResult() {
  revokeDownloads(downloads.value);
  downloads.value = [];
}
onBeforeUnmount(resetResult);
function onSelected(value) {
  resetResult();
  error.value = "";
  if (value.pageCount > MAX_ORGANIZE_PAGES) {
    selected.value = null;
    pages.value = [];
    error.value = `This tool supports up to ${MAX_ORGANIZE_PAGES} pages at a time. Split your document first.`;
    return;
  }
  selected.value = value;
  pages.value = Array.from({ length: value.pageCount }, (_, i) => ({
    id: i,
    original: i,
    rotation: 0,
  }));
}
function move(from, to) {
  if (busy.value) return;
  pages.value = moveIndexed(pages.value, from, to);
  resetResult();
}
function changeRotation(id) {
  if (busy.value) return;
  pages.value = pages.value.map((p) =>
    p.id === id ? { ...p, rotation: normalizedRotation(p.rotation, 90) } : p,
  );
  resetResult();
}
function remove(id) {
  if (busy.value) return;
  pages.value = pages.value.filter((p) => p.id !== id);
  resetResult();
}
function restore() {
  if (!selected.value || busy.value) return;
  pages.value = Array.from({ length: selected.value.pageCount }, (_, i) => ({
    id: i,
    original: i,
    rotation: 0,
  }));
  resetResult();
}
function dropAt(index) {
  if (dragged.value !== -1) move(dragged.value, index);
  dragged.value = -1;
}
async function save() {
  if (!selected.value || !pages.value.length || busy.value) return;
  busy.value = true;
  error.value = "";
  resetResult();
  try {
    const { PDFDocument, degrees } = await import("pdf-lib");
    const original = await PDFDocument.load(
      await selected.value.file.arrayBuffer(),
      { updateMetadata: false },
    );
    const target = await PDFDocument.create();
    const copy = await target.copyPages(
      original,
      pages.value.map((item) => item.original),
    );
    for (const [i, item] of pages.value.entries()) {
      const page = copy[i];
      if (item.rotation)
        page.setRotation(
          degrees(normalizedRotation(page.getRotation().angle, item.rotation)),
        );
      target.addPage(page);
    }
    const download = createDownload(
      await target.save({ useObjectStreams: true }),
      name.value,
    );
    downloads.value = [download];
    triggerDownload(download);
  } catch (e) {
    error.value = e.message || "Could not save these PDF pages.";
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <ToolLayout
    eyebrow="Rearrange document pages"
    title="Organize PDF pages"
    description="Reorder, rotate or remove pages in your PDF—without uploading your document anywhere."
    :steps="[
      'Choose a PDF from your device.',
      'Move pages up or down, rotate sideways pages, or remove pages you do not need.',
      'Save the updated PDF and check that its order looks right.',
    ]"
    note="Page cards show page numbers rather than thumbnails. The original file is never changed; you download a separate PDF."
    :faqs="[
      [
        'Can I undo changes?',
        'You can restore the original arrangement with Reset all pages before saving.',
      ],
      [
        'Does this tool delete pages from my original file?',
        'No. It only changes the PDF that you download.',
      ],
      [
        'Can I organize password-protected PDFs?',
        'No, this tool requires an unlocked PDF.',
      ],
    ]"
    :related="[
      { label: 'Split PDF', to: '/split-pdf' },
      { label: 'Rotate PDF', to: '/rotate-pdf' },
      { label: 'Merge PDF', to: '/merge-pdf' },
    ]"
  >
    <div class="surface-card p-5 sm:p-8">
      <SinglePdfSelect
        :disabled="busy"
        @selected="onSelected"
        @error="error = $event"
      />
      <div v-if="selected" class="mt-6">
        <div
          class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 text-sm"
        >
          <p class="min-w-0 break-all text-slate-700">
            <strong>{{ selected.file.name }}</strong> · {{ kept }} /
            {{ selected.pageCount }} pages kept ·
            {{ formatBytes(selected.file.size) }}
          </p>
          <button
            type="button"
            class="font-bold text-brand hover:underline"
            :disabled="busy"
            @click="restore"
          >
            Reset all pages
          </button>
        </div>
        <div class="mt-5 flex items-center justify-between gap-2">
          <h3 class="font-extrabold text-ink">Your page order</h3>
          <p class="text-xs text-slate-500">Drag cards or use arrow buttons</p>
        </div>
        <div
          v-if="!pages.length"
          role="alert"
          class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          No pages remain. Use Reset all pages to start again.
        </div>
        <ol
          v-else
          class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          <li
            v-for="(page, index) in pages"
            :key="page.id"
            class="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            draggable="true"
            @dragstart="dragged = index"
            @dragover.prevent
            @drop.prevent="dropAt(index)"
            @dragend="dragged = -1"
          >
            <div
              class="flex items-center justify-between gap-1 text-xs font-medium text-slate-500"
            >
              <span>Position {{ index + 1 }}</span
              ><span aria-label="Drag to reorder">⠿</span>
            </div>
            <div
              class="mt-3 flex h-28 flex-col items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-900"
              :style="{
                backgroundImage: 'linear-gradient(155deg,#eff6ff,#fff)',
              }"
            >
              <span class="text-[11px] font-semibold">PAGE</span
              ><span class="text-3xl font-black">{{ page.original + 1 }}</span
              ><span class="text-[11px] font-semibold">{{
                page.rotation ? `+${page.rotation}°` : "Original"
              }}</span>
            </div>
            <div class="mt-3 flex items-center justify-between gap-1">
              <button
                type="button"
                class="file-icon-btn"
                :aria-label="`Move page ${page.original + 1} left`"
                :disabled="busy || index === 0"
                @click="move(index, index - 1)"
              >
                ←</button
              ><button
                type="button"
                class="file-icon-btn"
                :aria-label="`Move page ${page.original + 1} right`"
                :disabled="busy || index === pages.length - 1"
                @click="move(index, index + 1)"
              >
                →</button
              ><button
                type="button"
                class="file-icon-btn"
                :aria-label="`Rotate page ${page.original + 1}`"
                :disabled="busy"
                @click="changeRotation(page.id)"
              >
                ↻</button
              ><button
                type="button"
                class="file-icon-btn text-red-700!"
                :aria-label="`Remove page ${page.original + 1}`"
                :disabled="busy"
                @click="remove(page.id)"
              >
                ×
              </button>
            </div>
          </li>
        </ol>
        <div class="mt-6 flex flex-wrap items-end gap-3">
          <label class="block flex-1 text-sm font-semibold text-ink"
            >Download filename<input
              v-model="name"
              class="tool-input mt-2"
              maxlength="100"
              :disabled="busy" /></label
          ><button
            type="button"
            class="btn-primary"
            :disabled="busy || !pages.length"
            @click="save"
          >
            {{ busy ? "Creating PDF…" : "Save & download PDF" }}
          </button>
        </div>
      </div>
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
      ><h2>Keep a PDF in the right order</h2>
      <p>
        Use the page cards to assemble a cleaner version of an existing PDF. You
        can move a title page to the front, remove a blank scan, or rotate one
        landscape sheet that was saved sideways. The numbered cards show
        original page numbers, while “Position” shows where each page will
        appear in the final document.
      </p>
      <p>
        For accuracy, this version does not claim to offer page-thumbnail
        previews. If visual previews are important for your documents, open the
        downloaded PDF and check its contents before sending it. Complex forms
        and digitally signed documents may be affected by page copying.
      </p></template
    >
  </ToolLayout>
</template>
