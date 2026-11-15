<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";

import {
  Upload,
  FileText,
  Minimize2,
  Image as ImageIcon,
  Download,
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  HardDriveDownload,
} from "@lucide/vue";

import {
  compressPdfFile,
  getCompressPdfInfo,
  MAX_COMPRESS_FILE_SIZE,
  MAX_RASTER_PAGES,
} from "~/utils/pdf/compressPdf.mjs";

const fileInput = ref(null);

const selectedFile = ref(null);
const pageCount = ref(0);

const reading = ref(false);
const processing = ref(false);

const mode = ref("optimize");
const dpi = ref(96);
const quality = ref(65);
const acceptRasterLoss = ref(false);

const progress = ref(0);
const status = ref("");
const error = ref("");

const result = ref(null);
const downloadUrl = ref("");

const resolutionOptions = [
  { value: 72, label: "72 DPI", hint: "Smallest images" },
  { value: 96, label: "96 DPI", hint: "Recommended" },
  { value: 120, label: "120 DPI", hint: "More detail" },
  { value: 144, label: "144 DPI", hint: "Highest resolution" },
];

const qualityOptions = [
  { value: 45, label: "Smaller file", hint: "Lower image quality" },
  { value: 65, label: "Balanced", hint: "Recommended" },
  { value: 80, label: "Better quality", hint: "Larger output" },
  { value: 90, label: "Maximum quality", hint: "Larger output" },
];

const busy = computed(() => reading.value || processing.value);

const canCompress = computed(() => {
  if (!selectedFile.value || busy.value) return false;

  if (mode.value === "rasterize") {
    if (pageCount.value > MAX_RASTER_PAGES || !acceptRasterLoss.value) {
      return false;
    }
  }

  return true;
});

const tooManyPages = computed(() => pageCount.value > MAX_RASTER_PAGES);

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const originalSizeLabel = computed(() =>
  selectedFile.value ? formatBytes(selectedFile.value.size) : "—",
);

const resultSizeLabel = computed(() =>
  result.value ? formatBytes(result.value.compressedSize) : "—",
);

const savedLabel = computed(() =>
  result.value ? `${result.value.savedPercent.toFixed(1)}%` : "—",
);

const reductionBar = computed(() => {
  if (!result.value?.improved) return 100;

  return Math.max(
    2,
    Math.min(
      100,
      (result.value.compressedSize / result.value.originalSize) * 100,
    ),
  );
});

function clearResult() {
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value);
  }

  downloadUrl.value = "";
  result.value = null;
}

watch(mode, () => {
  clearResult();
  error.value = "";
  acceptRasterLoss.value = false;
});

watch([dpi, quality], () => {
  clearResult();
});

function chooseFile() {
  if (!busy.value) {
    fileInput.value?.click();
  }
}

async function loadFile(file) {
  if (!file || busy.value) return;

  error.value = "";
  status.value = "";
  progress.value = 0;

  clearResult();

  selectedFile.value = null;
  pageCount.value = 0;
  acceptRasterLoss.value = false;

  if (file.size > MAX_COMPRESS_FILE_SIZE) {
    error.value = "Maximum PDF file size is 40 MB.";
    return;
  }

  reading.value = true;

  try {
    const info = await getCompressPdfInfo(file);

    selectedFile.value = file;
    pageCount.value = info.totalPages;
  } catch (err) {
    console.error("PDF inspection failed:", err);

    error.value = err?.message || "Unable to read the selected PDF.";
  } finally {
    reading.value = false;
  }
}

function onFileChange(event) {
  const file = event.target.files?.[0];

  if (file) {
    void loadFile(file);
  }

  // Permit choosing the same file again.
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

  clearResult();

  selectedFile.value = null;
  pageCount.value = 0;

  error.value = "";
  status.value = "";
  progress.value = 0;
  acceptRasterLoss.value = false;

  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

async function startCompression() {
  if (!canCompress.value) return;

  error.value = "";
  clearResult();

  processing.value = true;
  progress.value = 0;
  status.value = "Preparing PDF...";

  await nextTick();

  try {
    const output = await compressPdfFile(selectedFile.value, {
      mode: mode.value,
      dpi: dpi.value,
      quality: quality.value,

      onProgress: (value) => {
        progress.value = value;
      },

      onStatus: (message) => {
        status.value = message;
      },
    });

    result.value = output;

    if (output.improved && output.bytes) {
      const blob = new Blob([output.bytes], {
        type: "application/pdf",
      });

      downloadUrl.value = URL.createObjectURL(blob);

      status.value = "Compression completed!";
    } else {
      status.value = "No smaller version was produced.";
    }
  } catch (err) {
    console.error("PDF compression failed:", err);

    error.value = err?.message || "Unable to compress this PDF.";

    status.value = "";
  } finally {
    processing.value = false;
  }
}

onBeforeUnmount(() => {
  clearResult();
});
</script>

<template>
  <div class="mx-auto w-full max-w-6xl">
    <div
      class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <!-- FILE UPLOAD -->
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
              Choose the PDF file you want to make smaller.
            </p>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept=".pdf,application/pdf"
          aria-label="Choose PDF file"
          class="sr-only"
          @change="onFileChange"
        />

        <div
          class="mt-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-10 text-center transition hover:border-blue-400"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <Minimize2
            :size="46"
            :stroke-width="1.5"
            class="mx-auto text-blue-600"
          />

          <p class="mt-4 font-bold text-slate-900">Drop your PDF here</p>

          <p class="mt-2 text-sm text-slate-500">
            Or choose a file from your device.
          </p>

          <button
            type="button"
            :disabled="busy"
            class="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="chooseFile"
          >
            <Upload :size="18" />

            {{ reading ? "Reading PDF..." : "Choose PDF File" }}
          </button>

          <p class="mt-4 text-xs text-slate-500">
            PDF only · Maximum 40 MB · Local processing
          </p>
        </div>

        <!-- SELECTED FILE -->
        <div
          v-if="selectedFile"
          class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="flex min-w-0 items-center gap-3">
            <FileText :size="25" class="shrink-0 text-blue-600" />

            <div class="min-w-0">
              <p class="break-all text-sm font-bold text-slate-900">
                {{ selectedFile.name }}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                {{ pageCount }} pages · {{ originalSizeLabel }}
              </p>
            </div>
          </div>

          <button
            type="button"
            :disabled="busy"
            aria-label="Remove PDF"
            class="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            @click="removeFile"
          >
            <X :size="20" />
          </button>
        </div>
      </section>

      <!-- COMPRESSION SETTINGS -->
      <section class="p-5 sm:p-8">
        <h2 class="text-xl font-extrabold text-slate-900">
          Compression settings
        </h2>

        <p class="mt-2 text-sm leading-7 text-slate-600">
          Choose how you want to reduce the PDF file size.
        </p>

        <!-- MODE SELECTOR -->
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            :disabled="busy"
            :aria-pressed="mode === 'optimize'"
            class="rounded-2xl border p-5 text-left transition disabled:opacity-50"
            :class="
              mode === 'optimize'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                : 'border-slate-200 bg-white hover:border-blue-200'
            "
            @click="mode = 'optimize'"
          >
            <FileText :size="28" class="text-blue-600" />

            <h3 class="mt-4 font-extrabold text-slate-900">Preserve text</h3>

            <p class="mt-2 text-sm leading-6 text-slate-600">
              Attempt lossless structural optimization. Keep selectable text and
              page graphics.
            </p>

            <p class="mt-3 text-xs font-semibold text-blue-700">
              Limited size reduction
            </p>
          </button>

          <button
            type="button"
            :disabled="busy"
            :aria-pressed="mode === 'rasterize'"
            class="rounded-2xl border p-5 text-left transition disabled:opacity-50"
            :class="
              mode === 'rasterize'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                : 'border-slate-200 bg-white hover:border-blue-200'
            "
            @click="mode = 'rasterize'"
          >
            <ImageIcon :size="28" class="text-blue-600" />

            <h3 class="mt-4 font-extrabold text-slate-900">
              Image compression
            </h3>

            <p class="mt-2 text-sm leading-6 text-slate-600">
              Rebuild each page using compressed images. Useful for visually
              sharing documents.
            </p>

            <p class="mt-3 text-xs font-semibold text-blue-700">
              Potentially stronger compression
            </p>
          </button>
        </div>

        <!-- TEXT PRESERVING MODE -->
        <div
          v-if="mode === 'optimize'"
          class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <div class="flex items-start gap-3">
            <Info :size="22" class="mt-0.5 shrink-0 text-blue-600" />

            <div>
              <h3 class="text-sm font-extrabold text-slate-900">
                Text-preserving optimization
              </h3>

              <p class="mt-2 text-sm leading-7 text-slate-600">
                This method rewrites the PDF structure using compressed object
                streams. It does not recompress photographs already stored in
                the document, so some files may not get smaller.
              </p>

              <p class="mt-2 text-xs leading-6 text-slate-500">
                Avoid using this tool on digitally signed or security-sensitive
                PDF documents. Rewriting a PDF can invalidate signatures or
                alter interactive features.
              </p>
            </div>
          </div>
        </div>

        <!-- IMAGE COMPRESSION OPTIONS -->
        <div v-else class="mt-6 space-y-6">
          <!-- RESOLUTION -->
          <fieldset>
            <legend class="mb-3 text-sm font-bold text-slate-700">
              Page resolution
            </legend>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label
                v-for="item in resolutionOptions"
                :key="item.value"
                class="cursor-pointer rounded-xl border p-4 transition"
                :class="
                  dpi === item.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-200'
                "
              >
                <input
                  v-model.number="dpi"
                  type="radio"
                  name="compress-resolution"
                  :value="item.value"
                  :disabled="busy"
                  class="accent-blue-600"
                />

                <span class="mt-2 block text-sm font-extrabold text-slate-900">
                  {{ item.label }}
                </span>

                <span class="mt-1 block text-xs text-slate-500">
                  {{ item.hint }}
                </span>
              </label>
            </div>
          </fieldset>

          <!-- QUALITY -->
          <div>
            <label
              for="compress-quality"
              class="mb-2 block text-sm font-bold text-slate-700"
            >
              Image quality
            </label>

            <select
              id="compress-quality"
              v-model.number="quality"
              :disabled="busy"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option
                v-for="item in qualityOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }} ({{ item.value }}%)
              </option>
            </select>

            <p class="mt-2 text-xs leading-6 text-slate-500">
              Lower quality can produce smaller PDFs but may make fine text and
              details less sharp.
            </p>
          </div>

          <!-- WARNING -->
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div class="flex items-start gap-3">
              <AlertTriangle
                :size="22"
                class="mt-0.5 shrink-0 text-amber-700"
              />

              <div>
                <p class="text-sm font-extrabold text-amber-900">
                  Important: document features will be lost
                </p>

                <p class="mt-2 text-sm leading-7 text-amber-900">
                  Image compression removes selectable text, form fields, links,
                  bookmarks, accessibility information and digital signatures.
                  Do not use it for documents that require those features.
                </p>
              </div>
            </div>

            <label class="mt-5 flex cursor-pointer items-start gap-3">
              <input
                v-model="acceptRasterLoss"
                type="checkbox"
                :disabled="busy"
                class="mt-1 h-4 w-4 shrink-0 accent-blue-600"
              />

              <span class="text-sm font-semibold leading-6 text-amber-900">
                I understand that the output will contain page images rather
                than the original editable or searchable PDF content.
              </span>
            </label>
          </div>

          <p
            v-if="selectedFile && tooManyPages"
            class="text-sm font-semibold text-red-600"
          >
            Image compression supports up to
            {{ MAX_RASTER_PAGES }} pages. Choose Preserve text for this
            document.
          </p>
        </div>

        <!-- ERROR -->
        <div
          v-if="error"
          role="alert"
          class="mt-7 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertTriangle :size="20" class="shrink-0" />
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
              :style="{ width: progress + '%' }"
            ></div>
          </div>
        </div>

        <!-- COMPRESS -->
        <button
          type="button"
          :disabled="!canCompress"
          class="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="startCompression"
        >
          <Minimize2 :size="21" />

          {{ processing ? "Compressing PDF..." : "Compress PDF" }}
        </button>

        <!-- COMPRESSION RESULT -->
        <div
          v-if="result"
          class="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7"
          aria-live="polite"
        >
          <div class="flex items-center gap-3">
            <CheckCircle2
              v-if="result.improved"
              :size="27"
              class="text-blue-600"
            />

            <Info v-else :size="27" class="text-slate-500" />

            <h3 class="text-lg font-extrabold text-slate-900">
              {{
                result.improved
                  ? "Your PDF is smaller!"
                  : "No size reduction achieved"
              }}
            </h3>
          </div>

          <!-- SIZE COMPARISON -->
          <div class="mt-6 grid grid-cols-2 gap-4">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold text-slate-500">Original size</p>

              <p class="mt-2 text-xl font-extrabold text-slate-900">
                {{ originalSizeLabel }}
              </p>
            </div>

            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold text-slate-500">Processed size</p>

              <p class="mt-2 text-xl font-extrabold text-blue-600">
                {{ resultSizeLabel }}
              </p>
            </div>
          </div>

          <div v-if="result.improved" class="mt-6">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-slate-700">File size reduced</p>

              <p class="text-xl font-extrabold text-blue-600">
                {{ savedLabel }}
              </p>
            </div>

            <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full bg-blue-600"
                :style="{ width: reductionBar + '%' }"
              ></div>
            </div>

            <p class="mt-3 text-xs text-slate-500">
              Saved {{ formatBytes(result.savedBytes) }}
            </p>
          </div>

          <p v-else class="mt-5 text-sm leading-7 text-slate-600">
            This compression method produced a file that is not smaller than
            your original. No compressed download was generated. Try different
            settings or keep your original PDF.
          </p>

          <!-- DOWNLOAD -->
          <a
            v-if="result.improved && downloadUrl"
            :href="downloadUrl"
            :download="result.fileName"
            class="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-blue-700"
          >
            <Download :size="20" />
            Download Compressed PDF
          </a>

          <p
            v-if="result.improved && result.mode === 'rasterize'"
            class="mt-4 text-xs leading-6 text-amber-800"
          >
            Review the downloaded document carefully. Its pages have been
            converted into images.
          </p>
        </div>

        <!-- LOCAL PROCESSING -->
        <div
          class="mt-8 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-5"
        >
          <ShieldCheck :size="23" class="shrink-0 text-blue-600" />

          <div>
            <h3 class="text-sm font-extrabold text-slate-900">
              Browser-based compression
            </h3>

            <p class="mt-2 text-xs leading-6 text-slate-600">
              PDFEasy compresses this document locally in your browser. The file
              is not uploaded to a remote compression server.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
