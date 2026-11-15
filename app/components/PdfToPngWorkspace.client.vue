<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";

import {
  Upload,
  FileImage,
  FileText,
  Download,
  Archive,
  Settings2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from "@lucide/vue";

import {
  getPdfPngInfo,
  parsePngPageRange,
  convertPdfToPng,
  PDF_TO_PNG_MAX_PAGES,
} from "~/utils/pdf/pdfToPng.mjs";

const fileInput = ref(null);
const selectedFile = ref(null);
const pageCount = ref(0);

const reading = ref(false);
const processing = ref(false);

const pageRange = ref("all");
const dpi = ref(144);

const error = ref("");
const status = ref("");
const success = ref("");
const progress = ref(0);

const downloadUrl = ref("");
const downloadName = ref("");
const outputType = ref("");

const resolutionOptions = [
  {
    value: 96,
    name: "96 DPI",
    description: "Smaller images",
  },
  {
    value: 144,
    name: "144 DPI",
    description: "Recommended",
  },
  {
    value: 200,
    name: "200 DPI",
    description: "More detail",
  },
];

const busy = computed(() => reading.value || processing.value);

const rangeStatus = computed(() => {
  if (!pageCount.value) {
    return { pages: [], error: "" };
  }

  try {
    const pages = parsePngPageRange(pageRange.value, pageCount.value);

    if (pages.length > PDF_TO_PNG_MAX_PAGES) {
      return {
        pages: [],
        error: `Select up to ${PDF_TO_PNG_MAX_PAGES} pages at a time.`,
      };
    }

    return {
      pages,
      error: "",
    };
  } catch (err) {
    return {
      pages: [],
      error: err.message,
    };
  }
});

const selectedCount = computed(() => rangeStatus.value.pages.length);

const canConvert = computed(() => {
  return Boolean(
    selectedFile.value &&
    selectedCount.value > 0 &&
    !rangeStatus.value.error &&
    !busy.value,
  );
});

const fileSize = computed(() => {
  if (!selectedFile.value) return "";

  return (selectedFile.value.size / 1024 / 1024).toFixed(2) + " MB";
});

function clearDownload() {
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value);
  }

  downloadUrl.value = "";
  downloadName.value = "";
  outputType.value = "";
  success.value = "";
}

watch([pageRange, dpi], () => {
  clearDownload();
  error.value = "";
});

function openPicker() {
  if (!busy.value) {
    fileInput.value?.click();
  }
}

async function loadFile(file) {
  if (!file || busy.value) return;

  error.value = "";
  status.value = "";
  progress.value = 0;

  clearDownload();

  selectedFile.value = null;
  pageCount.value = 0;
  reading.value = true;

  try {
    const info = await getPdfPngInfo(file);

    selectedFile.value = file;
    pageCount.value = info.pageCount;

    // Reset page selection for every new PDF.
    pageRange.value = "all";
  } catch (err) {
    console.error("PDF to PNG read error:", err);

    error.value = err?.message || "Cannot read this PDF file.";
  } finally {
    reading.value = false;
  }
}

function onFileChange(event) {
  const file = event.target.files?.[0];

  if (file) {
    void loadFile(file);
  }

  // Allow the same file to be chosen again.
  event.target.value = "";
}

function onDrop(event) {
  event.preventDefault();

  if (busy.value) return;

  const file = event.dataTransfer?.files?.[0];

  if (file) {
    void loadFile(file);
  }
}

function removeFile() {
  if (busy.value) return;

  selectedFile.value = null;
  pageCount.value = 0;

  pageRange.value = "all";
  error.value = "";
  status.value = "";
  progress.value = 0;

  clearDownload();

  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

async function startConversion() {
  if (!canConvert.value) return;

  error.value = "";
  clearDownload();

  processing.value = true;
  progress.value = 0;
  status.value = "Preparing your PDF...";

  await nextTick();

  try {
    const result = await convertPdfToPng(selectedFile.value, {
      pageRange: pageRange.value,
      dpi: dpi.value,

      onProgress: (completed, total) => {
        progress.value = Math.round((completed / total) * 90);
      },

      onStatus: (message) => {
        status.value = message;
      },
    });

    downloadUrl.value = URL.createObjectURL(result.blob);

    downloadName.value = result.fileName;
    outputType.value = result.fileType;

    progress.value = 100;
    status.value = "Conversion complete!";

    success.value =
      `Converted ${result.convertedPages} ` +
      `of ${result.totalPages} PDF pages.`;
  } catch (err) {
    console.error("PDF to PNG failed:", err);

    error.value =
      err?.message || "Something went wrong while converting the PDF.";

    status.value = "";
  } finally {
    processing.value = false;
  }
}

onBeforeUnmount(() => {
  clearDownload();
});
</script>

<template>
  <div class="mx-auto w-full max-w-6xl">
    <div
      class="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
    >
      <!-- UPLOAD SECTION -->
      <section class="border-b border-slate-100 p-5 sm:p-8">
        <div class="flex items-center gap-3">
          <span
            class="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"
          >
            <Upload :size="23" />
          </span>

          <div>
            <h2 class="text-xl font-extrabold text-slate-900">
              Upload your PDF
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Choose a document to export as PNG images.
            </p>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept=".pdf,application/pdf"
          class="sr-only"
          aria-label="Choose PDF file"
          @change="onFileChange"
        />

        <div
          class="mt-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-10 text-center transition hover:border-blue-400"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <FileImage
            :size="46"
            :stroke-width="1.5"
            class="mx-auto text-blue-500"
          />

          <p class="mt-4 font-bold text-slate-900">Drop your PDF here</p>

          <p class="mt-2 text-sm text-slate-500">
            Or choose a file from your device.
          </p>

          <button
            type="button"
            :disabled="busy"
            class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="openPicker"
          >
            <Upload :size="17" />
            {{ reading ? "Reading PDF..." : "Choose PDF File" }}
          </button>

          <p class="mt-4 text-xs text-slate-500">
            PDF only · Maximum 40 MB · Browser-based processing
          </p>
        </div>

        <!-- SELECTED FILE -->
        <div
          v-if="selectedFile"
          class="mt-5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="flex min-w-0 items-center gap-3">
            <FileText :size="25" class="shrink-0 text-blue-600" />

            <div class="min-w-0">
              <p class="break-all text-sm font-bold text-slate-900">
                {{ selectedFile.name }}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                {{ pageCount }} pages · {{ fileSize }}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Remove PDF"
            :disabled="busy"
            class="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            @click="removeFile"
          >
            <X :size="20" />
          </button>
        </div>
      </section>

      <!-- SETTINGS SECTION -->
      <section class="p-5 sm:p-8">
        <div class="flex items-center gap-3">
          <Settings2 :size="25" class="text-blue-600" />

          <div>
            <h2 class="text-xl font-extrabold text-slate-900">
              PNG conversion settings
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Select the pages and image resolution.
            </p>
          </div>
        </div>

        <div
          class="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
        >
          <!-- CONTROLS -->
          <div class="space-y-6">
            <div>
              <label
                for="png-pages"
                class="mb-2 block text-sm font-bold text-slate-700"
              >
                Pages to convert
              </label>

              <input
                id="png-pages"
                v-model="pageRange"
                type="text"
                placeholder="all or 1-3,5"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p class="mt-2 text-xs text-slate-500">
                Examples: all, 1, 1-5, 2-4,8 or 2-.
              </p>

              <p
                v-if="rangeStatus.error"
                class="mt-2 text-xs font-medium text-red-600"
              >
                {{ rangeStatus.error }}
              </p>

              <p
                v-else-if="selectedFile"
                class="mt-2 text-xs font-semibold text-blue-600"
              >
                {{ selectedCount }} pages selected
              </p>
            </div>

            <!-- RESOLUTION -->
            <fieldset>
              <legend class="mb-3 text-sm font-bold text-slate-700">
                PNG image resolution
              </legend>

              <div class="grid gap-3 sm:grid-cols-3">
                <label
                  v-for="option in resolutionOptions"
                  :key="option.value"
                  class="cursor-pointer rounded-xl border p-4 transition"
                  :class="
                    dpi === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  "
                >
                  <input
                    v-model.number="dpi"
                    type="radio"
                    name="png-resolution"
                    :value="option.value"
                    class="accent-blue-600"
                  />

                  <span
                    class="mt-2 block text-sm font-extrabold text-slate-900"
                  >
                    {{ option.name }}
                  </span>

                  <span class="mt-1 block text-xs text-slate-500">
                    {{ option.description }}
                  </span>
                </label>
              </div>
            </fieldset>

            <!-- OUTPUT INFO -->
            <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div class="flex items-start gap-3">
                <component
                  :is="selectedCount === 1 ? FileImage : Archive"
                  :size="22"
                  class="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p class="text-sm font-bold text-slate-900">
                    {{
                      selectedCount === 1
                        ? "Output: PNG image"
                        : "Output: ZIP of PNG images"
                    }}
                  </p>

                  <p class="mt-1 text-xs leading-6 text-slate-600">
                    Export one page as PNG or multiple pages together in one ZIP
                    download.
                  </p>
                </div>
              </div>
            </div>

            <p class="text-xs leading-6 text-slate-500">
              PNG images use lossless compression. File sizes can be larger than
              JPG. For this version, pages use a white background.
            </p>
          </div>

          <!-- INFORMATION PANEL -->
          <div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div
                class="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm"
              >
                <FileImage
                  :size="62"
                  :stroke-width="1.3"
                  class="text-blue-600"
                />
              </div>

              <h3
                class="mt-6 text-center text-lg font-extrabold text-slate-900"
              >
                Sharp PNG images
              </h3>

              <p class="mt-3 text-center text-sm leading-7 text-slate-600">
                Export PDF pages as images for reports, presentations and
                sharing.
              </p>

              <div
                class="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-4"
              >
                <ShieldCheck :size="22" class="shrink-0 text-blue-600" />

                <div>
                  <p class="text-sm font-bold text-slate-900">
                    Local processing
                  </p>

                  <p class="mt-1 text-xs leading-6 text-slate-600">
                    The PDF is converted in your browser. No document upload to
                    a conversion server is required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ERROR -->
        <div
          v-if="error"
          role="alert"
          class="mt-7 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle :size="20" class="shrink-0" />
          <span>{{ error }}</span>
        </div>

        <!-- PROGRESS -->
        <div
          v-if="processing"
          role="status"
          aria-live="polite"
          class="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-bold text-slate-900">
              {{ status }}
            </p>

            <span class="text-sm font-bold text-blue-600">
              {{ progress }}%
            </span>
          </div>

          <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              class="h-full rounded-full bg-blue-600 transition-all"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <!-- CONVERT BUTTON -->
        <button
          type="button"
          :disabled="!canConvert"
          class="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="startConversion"
        >
          <FileImage :size="21" />

          {{ processing ? "Converting PDF..." : "Convert PDF to PNG" }}
        </button>

        <!-- DOWNLOAD RESULT -->
        <div
          v-if="downloadUrl"
          class="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center"
          aria-live="polite"
        >
          <CheckCircle2 :size="36" class="mx-auto text-blue-600" />

          <h3 class="mt-3 text-lg font-extrabold text-slate-900">
            Your PNG images are ready!
          </h3>

          <p class="mt-2 text-sm text-slate-600">
            {{ success }}
          </p>

          <a
            :href="downloadUrl"
            :download="downloadName"
            class="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            <Download :size="19" />

            {{
              outputType === "application/zip" ? "Download ZIP" : "Download PNG"
            }}
          </a>
        </div>

        <p class="mt-5 text-center text-xs leading-6 text-slate-500">
          Maximum {{ PDF_TO_PNG_MAX_PAGES }} pages per export. Large PDFs may
          require more browser memory.
        </p>
      </section>
    </div>
  </div>
</template>
