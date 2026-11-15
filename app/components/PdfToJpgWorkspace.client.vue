<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from "vue";

import {
  Upload,
  FileImage,
  FileText,
  Images,
  Archive,
  Download,
  X,
  Settings2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "@lucide/vue";

import {
  getPdfJpgInfo,
  parsePdfJpgPages,
  convertPdfToJpg,
} from "~/utils/pdf/pdfToJpg.mjs";

const fileInput = ref(null);
const selectedFile = ref(null);
const pageCount = ref(0);

const reading = ref(false);
const processing = ref(false);

const pageRange = ref("all");
const dpi = ref(144);
const quality = ref(90);

const error = ref("");
const success = ref("");
const status = ref("");
const progress = ref(0);

const downloadUrl = ref("");
const downloadName = ref("");
const downloadType = ref("");

const qualityOptions = [
  { label: "Standard", value: 75 },
  { label: "High", value: 90 },
  { label: "Maximum", value: 100 },
];

const resolutionOptions = [
  {
    value: 96,
    label: "96 DPI",
    description: "Smaller JPG files",
  },
  {
    value: 144,
    label: "144 DPI",
    description: "Recommended",
  },
  {
    value: 200,
    label: "200 DPI",
    description: "More detail",
  },
];

const busy = computed(() => reading.value || processing.value);

const rangeStatus = computed(() => {
  if (!pageCount.value) {
    return { pages: [], error: "" };
  }

  try {
    const pages = parsePdfJpgPages(pageRange.value, pageCount.value);

    if (pages.length > 40) {
      return {
        pages: [],
        error: "Select a maximum of 40 pages per conversion.",
      };
    }

    return { pages, error: "" };
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
    pageCount.value > 0 &&
    selectedCount.value > 0 &&
    !rangeStatus.value.error &&
    !busy.value,
  );
});

const fileSize = computed(() => {
  if (!selectedFile.value) return "";

  return (selectedFile.value.size / (1024 * 1024)).toFixed(2) + " MB";
});

function clearDownload() {
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value);
  }

  downloadUrl.value = "";
  downloadName.value = "";
  downloadType.value = "";
  success.value = "";
}

watch([pageRange, dpi, quality], clearDownload);

function openPicker() {
  if (!busy.value) {
    fileInput.value?.click();
  }
}

async function loadFile(file) {
  if (!file || busy.value) return;

  error.value = "";
  clearDownload();

  selectedFile.value = null;
  pageCount.value = 0;
  reading.value = true;

  try {
    const info = await getPdfJpgInfo(file);

    selectedFile.value = file;
    pageCount.value = info.pageCount;
    pageRange.value = "all";
  } catch (err) {
    console.error("PDF loading error:", err);

    error.value = err?.message || "Could not open the selected PDF.";
  } finally {
    reading.value = false;
  }
}

function onFileChange(event) {
  const file = event.target.files?.[0];

  if (file) {
    void loadFile(file);
  }

  event.target.value = "";
}

function onDrop(event) {
  event.preventDefault();

  if (!busy.value) {
    const file = event.dataTransfer?.files?.[0];

    if (file) {
      void loadFile(file);
    }
  }
}

function removeFile() {
  if (busy.value) return;

  clearDownload();
  selectedFile.value = null;
  pageCount.value = 0;
  pageRange.value = "all";
  error.value = "";
  status.value = "";
  progress.value = 0;
}

async function startConversion() {
  if (!canConvert.value) return;

  error.value = "";
  clearDownload();

  processing.value = true;
  progress.value = 0;
  status.value = "Preparing PDF...";

  await nextTick();

  try {
    const result = await convertPdfToJpg(selectedFile.value, {
      pageRange: pageRange.value,
      dpi: dpi.value,
      quality: quality.value,

      onProgress: (completed, total) => {
        progress.value = Math.round((completed / total) * 90);
      },

      onStatus: (message) => {
        status.value = message;
      },
    });

    downloadUrl.value = URL.createObjectURL(result.blob);

    downloadName.value = result.fileName;
    downloadType.value = result.fileType;

    progress.value = 100;

    success.value =
      `Converted ${result.convertedPages} ` +
      `of ${result.totalPages} PDF pages.`;

    status.value = "Conversion complete!";
  } catch (err) {
    console.error("PDF conversion failed:", err);

    error.value = err?.message || "Unable to convert this PDF.";

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
      <!-- UPLOAD -->
      <section class="border-b border-slate-100 p-5 sm:p-8">
        <div class="flex items-center gap-3">
          <span
            class="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"
          >
            <Upload :size="23" />
          </span>

          <div>
            <h2 class="text-xl font-extrabold text-slate-900">Upload PDF</h2>

            <p class="mt-1 text-sm text-slate-500">
              Select a PDF to convert into JPG images.
            </p>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept=".pdf,application/pdf"
          class="sr-only"
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
            PDF only · Maximum 40 MB · Local processing
          </p>
        </div>

        <!-- FILE INFORMATION -->
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
            class="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            :disabled="busy"
            @click="removeFile"
          >
            <X :size="20" />
          </button>
        </div>
      </section>

      <!-- SETTINGS -->
      <section class="p-5 sm:p-8">
        <div class="flex items-center gap-3">
          <Settings2 :size="25" class="text-blue-600" />

          <div>
            <h2 class="text-xl font-extrabold text-slate-900">
              Conversion settings
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Choose which pages to convert and the JPG quality.
            </p>
          </div>
        </div>

        <div
          class="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
        >
          <div class="space-y-6">
            <!-- PAGE RANGE -->
            <div>
              <label
                for="jpg-pages"
                class="mb-2 block text-sm font-bold text-slate-700"
              >
                Pages to convert
              </label>

              <input
                id="jpg-pages"
                v-model="pageRange"
                type="text"
                placeholder="all or 1-3,5"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p class="mt-2 text-xs text-slate-500">
                Examples: all, 1, 1-3, 2-5,8, or 2-.
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
                Image resolution
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
                    name="jpg-resolution"
                    :value="option.value"
                    class="accent-blue-600"
                  />

                  <span
                    class="mt-2 block text-sm font-extrabold text-slate-900"
                  >
                    {{ option.label }}
                  </span>

                  <span class="mt-1 block text-xs text-slate-500">
                    {{ option.description }}
                  </span>
                </label>
              </div>
            </fieldset>

            <!-- QUALITY -->
            <div>
              <label
                for="jpg-quality"
                class="mb-2 block text-sm font-bold text-slate-700"
              >
                JPG quality
              </label>

              <select
                id="jpg-quality"
                v-model.number="quality"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option
                  v-for="option in qualityOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }} ({{ option.value }}%)
                </option>
              </select>

              <p class="mt-2 text-xs leading-6 text-slate-500">
                Higher resolution and quality can produce larger JPG files and
                take more time.
              </p>
            </div>

            <!-- OUTPUT -->
            <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div class="flex items-start gap-3">
                <component
                  :is="selectedCount === 1 ? Images : Archive"
                  :size="22"
                  class="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p class="text-sm font-bold text-slate-900">
                    {{
                      selectedCount === 1
                        ? "Output: JPG image"
                        : "Output: ZIP of JPG images"
                    }}
                  </p>

                  <p class="mt-1 text-xs leading-6 text-slate-600">
                    A single page downloads as JPG. Multiple selected pages
                    download together in a ZIP.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT INFORMATION -->
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
                PDF pages into images
              </h3>

              <p class="mt-3 text-center text-sm leading-7 text-slate-600">
                Export document pages as JPG images for presentations, sharing,
                and other uses.
              </p>

              <div
                class="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-4"
              >
                <ShieldCheck :size="22" class="shrink-0 text-blue-600" />

                <div>
                  <p class="text-sm font-bold text-slate-900">
                    Private processing
                  </p>

                  <p class="mt-1 text-xs leading-6 text-slate-600">
                    Your PDF is processed locally in your browser. The document
                    is not uploaded to a conversion server.
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
          class="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5"
          role="status"
          aria-live="polite"
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
              :style="{ width: progress + '%' }"
            ></div>
          </div>
        </div>

        <!-- CONVERT -->
        <button
          type="button"
          :disabled="!canConvert"
          class="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="startConversion"
        >
          <FileImage :size="21" />

          {{ processing ? "Converting PDF..." : "Convert PDF to JPG" }}
        </button>

        <!-- SUCCESS -->
        <div
          v-if="downloadUrl"
          class="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center"
          aria-live="polite"
        >
          <CheckCircle2 :size="36" class="mx-auto text-blue-600" />

          <h3 class="mt-3 text-lg font-extrabold text-slate-900">
            Your JPG images are ready!
          </h3>

          <p class="mt-2 text-sm text-slate-600">
            {{ success }}
          </p>

          <a
            :href="downloadUrl"
            :download="downloadName"
            class="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-700"
          >
            <Download :size="19" />

            {{
              downloadType === "application/zip"
                ? "Download ZIP"
                : "Download JPG"
            }}
          </a>
        </div>

        <p class="mt-5 text-center text-xs leading-6 text-slate-500">
          Maximum 40 pages per conversion. Large or complex PDFs may need more
          browser memory.
        </p>
      </section>
    </div>
  </div>
</template>
