<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import { formatBytes } from "~/utils/files.mjs";
import {
  TOOL_MAX_IMAGES,
  TOOL_MAX_IMAGE_TOTAL,
  validateImageUpload,
  moveIndexed,
  createDownload,
  triggerDownload,
  revokeDownloads,
} from "~/utils/pdf-toolkit.mjs";

usePageSeo({
  title: "JPG to PDF Converter Online Free | PDFEasy",
  description:
    "Convert JPG and PNG images to PDF online for free. " +
    "Combine multiple images into one PDF, arrange " +
    "their order and download your document easily.",
  path: "/jpg-to-pdf",
});

const picker = ref(null);
const images = ref([]);
const busy = ref(false);
const draggingOver = ref(false);
const error = ref("");
const status = ref("");
const filename = ref("images-to-pdf.pdf");
const pageSize = ref("a4");
const margin = ref("small");
const downloads = ref([]);
let nextId = 1;
const totalBytes = computed(() =>
  images.value.reduce((sum, item) => sum + item.file.size, 0),
);
function resetDownloads() {
  revokeDownloads(downloads.value);
  downloads.value = [];
  status.value = "";
}
function releaseImages() {
  for (const image of images.value) URL.revokeObjectURL(image.url);
}
onBeforeUnmount(() => {
  resetDownloads();
  releaseImages();
});
function openPicker() {
  if (!busy.value) picker.value?.click();
}
function onInput(event) {
  const selected = [...(event.target.files || [])];
  event.target.value = "";
  void addImages(selected);
}
function onDrop(event) {
  draggingOver.value = false;
  void addImages([...(event.dataTransfer?.files || [])]);
}
async function addImages(selected) {
  if (busy.value || !selected.length) return;
  busy.value = true;
  error.value = "";
  resetDownloads();
  let size = totalBytes.value;
  const added = [];
  const errors = [];
  for (const file of selected) {
    const issue = validateImageUpload(
      file,
      images.value.length + added.length,
      size,
    );
    if (issue) {
      errors.push(issue);
      continue;
    }
    try {
      const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
      const jpg =
        header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
      const png =
        header.length >= 8 &&
        [137, 80, 78, 71, 13, 10, 26, 10].every(
          (byte, i) => header[i] === byte,
        );
      if (!jpg && !png) {
        errors.push(`${file.name}: unsupported or damaged image.`);
        continue;
      }
      const url = URL.createObjectURL(file);
      added.push({ id: nextId++, file, url, kind: jpg ? "jpg" : "png" });
      size += file.size;
    } catch {
      errors.push(`${file.name}: could not read image.`);
    }
  }
  images.value = [...images.value, ...added];
  error.value =
    errors.slice(0, 3).join(" ") +
    (errors.length > 3 ? " More files were skipped." : "");
  busy.value = false;
}
function move(from, to) {
  if (busy.value) return;
  images.value = moveIndexed(images.value, from, to);
  resetDownloads();
}
function remove(id) {
  if (busy.value) return;
  const found = images.value.find((item) => item.id === id);
  if (found) URL.revokeObjectURL(found.url);
  images.value = images.value.filter((item) => item.id !== id);
  resetDownloads();
}
function clear() {
  if (busy.value) return;
  releaseImages();
  images.value = [];
  error.value = "";
  resetDownloads();
}
async function generate() {
  if (!images.value.length || busy.value) return;
  busy.value = true;
  error.value = "";
  resetDownloads();
  status.value = "Converting your images…";
  try {
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.create();
    for (const item of images.value) {
      const buffer = await item.file.arrayBuffer();
      const picture =
        item.kind === "jpg"
          ? await pdf.embedJpg(buffer)
          : await pdf.embedPng(buffer);
      let width, height;
      if (pageSize.value === "original") {
        width = picture.width;
        height = picture.height;
        const scale = Math.min(1, 14400 / Math.max(width, height));
        width *= scale;
        height *= scale;
      } else {
        const landscape =
          pageSize.value === "a4-auto" && picture.width > picture.height;
        width = landscape ? 841.89 : 595.28;
        height = landscape ? 595.28 : 841.89;
      }
      const page = pdf.addPage([width, height]);
      const pad =
        pageSize.value === "original" ? 0 : margin.value === "none" ? 0 : 24;
      const factor = Math.min(
        (width - pad * 2) / picture.width,
        (height - pad * 2) / picture.height,
      );
      const drawnWidth = picture.width * factor,
        drawnHeight = picture.height * factor;
      page.drawImage(picture, {
        x: (width - drawnWidth) / 2,
        y: (height - drawnHeight) / 2,
        width: drawnWidth,
        height: drawnHeight,
      });
    }
    const item = createDownload(
      await pdf.save({ useObjectStreams: true }),
      filename.value,
    );
    downloads.value = [item];
    status.value = `${images.value.length} image${images.value.length === 1 ? "" : "s"} converted into a PDF.`;
    triggerDownload(item);
  } catch (e) {
    error.value = `Could not convert these images. ${e?.message || "Try fewer or smaller files."}`;
    status.value = "";
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <ToolLayout
    eyebrow="Images into documents"
    title="JPG to PDF online"
    description="Turn your JPG or PNG pictures into one neat PDF, in exactly the order you choose."
    :steps="[
      'Select JPG, JPEG or PNG images from your device.',
      'Arrange the order and choose the PDF page layout.',
      'Click Convert & download to create your PDF.',
    ]"
    note="Each image becomes one PDF page. The original pictures are not uploaded, but large photos can create a large PDF; this tool does not promise file-size compression."
    :faqs="[
      [
        'Can I convert several JPG files together?',
        'Yes. Each picture becomes a page of one PDF, in the displayed order.',
      ],
      ['Can I include PNG images?', 'Yes, both JPEG and PNG are supported.'],
      [
        'What does Original image size mean?',
        'It creates a page based on the image dimensions. For printing, A4 is usually more convenient.',
      ],
    ]"
    :related="[
      { label: 'Merge PDF', to: '/merge-pdf' },
      { label: 'Organize PDF pages', to: '/organize-pdf' },
    ]"
  >
    <div class="surface-card p-5 sm:p-8">
      <input
        ref="picker"
        type="file"
        class="sr-only"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        multiple
        :disabled="busy"
        aria-label="Choose JPG or PNG images"
        @change="onInput"
      />
      <div
        class="rounded-2xl border-2 border-dashed p-7 text-center sm:p-9"
        :class="
          draggingOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-blue-200 bg-[#f8fbff]'
        "
        @dragenter.prevent="draggingOver = true"
        @dragover.prevent="draggingOver = true"
        @dragleave.prevent="draggingOver = false"
        @drop.prevent="onDrop"
      >
        <div class="text-3xl" aria-hidden="true">▧</div>
        <h2 class="mt-3 text-lg font-extrabold text-ink">Choose images</h2>
        <p class="mt-1 text-sm text-slate-600">
          Drag images here or browse your files
        </p>
        <button
          type="button"
          class="btn-primary mt-5"
          :disabled="busy || images.length >= TOOL_MAX_IMAGES"
          @click="openPicker"
        >
          + {{ images.length ? "Add more images" : "Select JPG / PNG files" }}
        </button>
        <p class="mt-3 text-xs text-slate-500">
          Up to {{ TOOL_MAX_IMAGES }} images · 20 MB each ·
          {{ formatBytes(TOOL_MAX_IMAGE_TOTAL) }} total
        </p>
      </div>
      <div v-if="images.length" class="mt-6">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 class="font-extrabold text-ink">
            Your images ({{ images.length }})
          </h3>
          <button
            type="button"
            class="text-sm font-semibold text-red-700 hover:underline"
            :disabled="busy"
            @click="clear"
          >
            Remove all
          </button>
        </div>
        <ul class="grid gap-3 sm:grid-cols-2" aria-label="Selected images">
          <li
            v-for="(item, i) in images"
            :key="item.id"
            class="flex min-w-0 gap-3 rounded-xl border border-slate-200 bg-white p-3"
          >
            <img
              :src="item.url"
              :alt="`Preview of ${item.file.name}`"
              class="h-20 w-20 shrink-0 rounded-lg bg-slate-50 object-contain"
            />
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-semibold text-ink"
                :title="item.file.name"
              >
                {{ i + 1 }}. {{ item.file.name }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ formatBytes(item.file.size) }}
              </p>
              <div class="mt-2 flex gap-1">
                <button
                  type="button"
                  class="file-icon-btn"
                  :disabled="busy || i === 0"
                  :aria-label="`Move ${item.file.name} up`"
                  @click="move(i, i - 1)"
                >
                  ↑</button
                ><button
                  type="button"
                  class="file-icon-btn"
                  :disabled="busy || i === images.length - 1"
                  :aria-label="`Move ${item.file.name} down`"
                  @click="move(i, i + 1)"
                >
                  ↓</button
                ><button
                  type="button"
                  class="file-icon-btn text-red-700!"
                  :disabled="busy"
                  :aria-label="`Remove ${item.file.name}`"
                  @click="remove(item.id)"
                >
                  ×
                </button>
              </div>
            </div>
          </li>
        </ul>
        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <label class="block text-sm font-semibold"
            >Page size<select
              v-model="pageSize"
              class="tool-input mt-2"
              :disabled="busy"
            >
              <option value="a4">A4 portrait</option>
              <option value="a4-auto">A4 auto orientation</option>
              <option value="original">Original image size</option>
            </select></label
          >
          <label class="block text-sm font-semibold"
            >Margins<select
              v-model="margin"
              class="tool-input mt-2"
              :disabled="busy || pageSize === 'original'"
            >
              <option value="small">Small</option>
              <option value="none">None</option>
            </select></label
          >
          <label class="block text-sm font-semibold"
            >Download filename<input
              v-model="filename"
              class="tool-input mt-2"
              maxlength="100"
              :disabled="busy"
          /></label>
        </div>
        <button
          type="button"
          class="btn-primary mt-6 w-full sm:w-auto"
          :disabled="busy"
          @click="generate"
        >
          {{ busy ? "Converting…" : "Convert & download PDF" }}
        </button>
      </div>
      <p v-if="status" role="status" class="mt-4 text-sm text-slate-600">
        {{ status }}
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
      ><h2>Convert photos, scans and receipts into a PDF</h2>
      <p>
        Many forms, class notes and receipts arrive as separate phone photos.
        Combining pictures into one PDF makes them easier to store and send.
        PDFEasy places one image on each PDF page and lets you change the
        sequence before conversion. Choose A4 for a consistent printable
        document, or original image size when page proportions matter more.
      </p>
      <p>
        Images are processed on your device using your web browser. This tool
        does not send your photographs to a PDF conversion server.
      </p></template
    >
  </ToolLayout>
</template>
