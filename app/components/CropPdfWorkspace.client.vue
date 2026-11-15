<script setup>
import { ref, reactive, computed, watch, nextTick, onBeforeUnmount } from "vue";

import {
  Upload,
  FileText,
  Crop,
  Move,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "@lucide/vue";

import {
  validateCropPdf,
  validateCropRect,
  parseCropPages,
  cropPdfFile,
  DEFAULT_CROP_RECT,
} from "~/utils/pdf/cropPdf.mjs";

const pdfInput = ref(null);
const previewCanvas = ref(null);

const selectedFile = ref(null);
const totalPages = ref(0);
const currentPage = ref(1);

const reading = ref(false);
const rendering = ref(false);
const processing = ref(false);
const previewReady = ref(false);

const error = ref("");
const success = ref("");
const status = ref("");
const progress = ref(0);

const downloadUrl = ref("");
const downloadName = ref("");

const pageRange = ref("all");

const crop = reactive({
  ...DEFAULT_CROP_RECT,
});

let loadingTask = null;
let pdfDocument = null;
let renderTask = null;
let dragSession = null;

const busy = computed(
  () => reading.value || rendering.value || processing.value,
);

const selectedPages = computed(() => {
  if (!totalPages.value) {
    return { count: 0, error: "" };
  }

  try {
    const pages = parseCropPages(pageRange.value, totalPages.value);

    return {
      count: pages.length,
      error: "",
    };
  } catch (err) {
    return {
      count: 0,
      error: err.message,
    };
  }
});

const validCrop = computed(() => {
  try {
    validateCropRect(crop);
    return true;
  } catch {
    return false;
  }
});

const canCrop = computed(() => {
  return Boolean(
    selectedFile.value &&
    previewReady.value &&
    selectedPages.value.count > 0 &&
    !selectedPages.value.error &&
    validCrop.value &&
    !busy.value,
  );
});

const fileSize = computed(() => {
  if (!selectedFile.value) return "";

  return (selectedFile.value.size / 1024 / 1024).toFixed(2) + " MB";
});

const cropStyle = computed(() => ({
  left: `${crop.x * 100}%`,
  top: `${crop.y * 100}%`,
  width: `${crop.width * 100}%`,
  height: `${crop.height * 100}%`,
}));

const margins = computed(() => ({
  left: Math.round(crop.x * 100),
  top: Math.round(crop.y * 100),
  right: Math.round((1 - crop.x - crop.width) * 100),
  bottom: Math.round((1 - crop.y - crop.height) * 100),
}));

function clearOutput() {
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value);
  }

  downloadUrl.value = "";
  downloadName.value = "";
  success.value = "";
}

watch(
  [pageRange, () => crop.x, () => crop.y, () => crop.width, () => crop.height],
  clearOutput,
);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetCrop() {
  if (busy.value) return;

  Object.assign(crop, DEFAULT_CROP_RECT);
  error.value = "";
  clearOutput();
}

function setMargin(side, input) {
  if (busy.value) return;

  const value = Number(input);

  if (!Number.isFinite(value)) return;

  let left = crop.x * 100;
  let top = crop.y * 100;
  let right = (1 - crop.x - crop.width) * 100;
  let bottom = (1 - crop.y - crop.height) * 100;

  if (side === "left") {
    left = clamp(value, 0, 95 - right);
  } else if (side === "right") {
    right = clamp(value, 0, 95 - left);
  } else if (side === "top") {
    top = clamp(value, 0, 95 - bottom);
  } else if (side === "bottom") {
    bottom = clamp(value, 0, 95 - top);
  }

  crop.x = left / 100;
  crop.y = top / 100;
  crop.width = (100 - left - right) / 100;
  crop.height = (100 - top - bottom) / 100;

  clearOutput();
}

// -----------------------------------
// PDF.js
// -----------------------------------
async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist/build/pdf.mjs"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);

  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  return pdfjs;
}

async function releasePdf() {
  previewReady.value = false;

  if (renderTask) {
    const activeTask = renderTask;
    renderTask = null;

    activeTask.cancel();

    try {
      await activeTask.promise;
    } catch {
      // Expected when cancelling a PDF render.
    }
  }

  if (loadingTask) {
    const activeLoadingTask = loadingTask;
    loadingTask = null;

    try {
      await activeLoadingTask.destroy();
    } catch {
      // Already destroyed.
    }
  }

  pdfDocument = null;
}

async function renderCurrentPage() {
  if (!pdfDocument || !previewCanvas.value) return;

  rendering.value = true;
  previewReady.value = false;

  let page = null;

  try {
    page = await pdfDocument.getPage(currentPage.value);

    const base = page.getViewport({
      scale: 1,
    });

    const pixelLimit = Math.sqrt(2_000_000 / (base.width * base.height));

    const scale = Math.min(
      1.5,
      pixelLimit,
      1400 / Math.max(base.width, base.height),
    );

    if (!Number.isFinite(scale) || scale <= 0) {
      throw new Error("Invalid PDF page dimensions.");
    }

    const viewport = page.getViewport({ scale });

    const canvas = previewCanvas.value;

    canvas.width = Math.max(1, Math.floor(viewport.width));

    canvas.height = Math.max(1, Math.floor(viewport.height));

    const context = canvas.getContext("2d", {
      alpha: false,
    });

    if (!context) {
      throw new Error("Your browser cannot render this PDF.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    renderTask = page.render({
      canvas,
      canvasContext: context,
      viewport,
      background: "#ffffff",
    });

    await renderTask.promise;

    previewReady.value = true;
  } catch (err) {
    console.error("PDF preview failed:", err);

    error.value = "Unable to render this PDF page.";

    previewReady.value = false;
  } finally {
    renderTask = null;
    page?.cleanup();
    rendering.value = false;
  }
}

async function loadPdf(file) {
  if (!file || busy.value) return;

  error.value = "";
  status.value = "";
  progress.value = 0;
  clearOutput();

  reading.value = true;

  await releasePdf();

  selectedFile.value = null;
  totalPages.value = 0;

  try {
    validateCropPdf(file);

    const pdfjs = await loadPdfJs();

    const data = new Uint8Array(await file.arrayBuffer());

    loadingTask = pdfjs.getDocument({ data });
    pdfDocument = await loadingTask.promise;

    if (!pdfDocument.numPages) {
      throw new Error("The PDF has no pages.");
    }

    selectedFile.value = file;
    totalPages.value = pdfDocument.numPages;
    currentPage.value = 1;
    pageRange.value = "all";

    Object.assign(crop, DEFAULT_CROP_RECT);

    await nextTick();
    await renderCurrentPage();
  } catch (err) {
    console.error("Cannot open PDF:", err);

    error.value =
      err?.name === "PasswordException"
        ? "Password-protected PDFs are not supported."
        : err?.message || "Unable to open this PDF.";

    await releasePdf();

    selectedFile.value = null;
    totalPages.value = 0;
  } finally {
    reading.value = false;
  }
}

function onPdfChange(event) {
  const file = event.target.files?.[0];

  if (file) void loadPdf(file);

  event.target.value = "";
}

function onDrop(event) {
  event.preventDefault();

  if (busy.value) return;

  const file = event.dataTransfer?.files?.[0];

  if (file) void loadPdf(file);
}

async function changePage(offset) {
  if (busy.value || !pdfDocument) return;

  const page = currentPage.value + offset;

  if (page < 1 || page > totalPages.value) {
    return;
  }

  error.value = "";
  currentPage.value = page;

  await renderCurrentPage();
}

function removePdf() {
  if (busy.value) return;

  clearOutput();

  selectedFile.value = null;
  totalPages.value = 0;
  pageRange.value = "all";
  error.value = "";
  status.value = "";
  progress.value = 0;

  void releasePdf();

  if (pdfInput.value) {
    pdfInput.value.value = "";
  }
}

// -----------------------------------
// VISUAL CROP SELECTION
// -----------------------------------
function getPointerPosition(event) {
  const bounds = event.currentTarget.getBoundingClientRect();

  return {
    x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
    y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
  };
}

function beginSelection(event) {
  if (!previewReady.value || busy.value) {
    return;
  }

  if (event.button > 0) return;

  event.preventDefault();

  const point = getPointerPosition(event);

  dragSession = {
    pointerId: event.pointerId,
    start: point,
    previous: { ...crop },
  };

  event.currentTarget.setPointerCapture(event.pointerId);

  crop.x = point.x;
  crop.y = point.y;
  crop.width = 0;
  crop.height = 0;
}

function moveSelection(event) {
  if (!dragSession || event.pointerId !== dragSession.pointerId) {
    return;
  }

  event.preventDefault();

  const point = getPointerPosition(event);
  const start = dragSession.start;

  crop.x = Math.min(start.x, point.x);
  crop.y = Math.min(start.y, point.y);
  crop.width = Math.abs(point.x - start.x);
  crop.height = Math.abs(point.y - start.y);
}

function endSelection(event) {
  if (!dragSession || event.pointerId !== dragSession.pointerId) {
    return;
  }

  const previous = dragSession.previous;
  dragSession = null;

  // Ignore accidental clicks or very tiny selections.
  if (crop.width < 0.05 || crop.height < 0.05) {
    Object.assign(crop, previous);
  }

  clearOutput();
}

// -----------------------------------
// DOWNLOAD
// -----------------------------------
async function generateCroppedPdf() {
  if (!canCrop.value) return;

  error.value = "";
  clearOutput();

  processing.value = true;
  progress.value = 0;
  status.value = "Cropping your PDF...";

  await nextTick();

  try {
    const result = await cropPdfFile(selectedFile.value, {
      rect: { ...crop },
      pageRange: pageRange.value,

      onProgress: (completed, total) => {
        progress.value = Math.round((completed / total) * 90);
      },
    });

    const blob = new Blob([result.bytes], {
      type: "application/pdf",
    });

    downloadUrl.value = URL.createObjectURL(blob);
    downloadName.value = result.fileName;

    success.value =
      `Cropped ${result.croppedPages} ` + `of ${result.totalPages} pages.`;

    progress.value = 100;
    status.value = "Your PDF is ready.";
  } catch (err) {
    console.error("Crop PDF failed:", err);

    error.value = err?.message || "Unable to crop this PDF.";
  } finally {
    processing.value = false;
  }
}

onBeforeUnmount(() => {
  clearOutput();
  void releasePdf();
});
</script>

<template>
  <div class="mx-auto w-full max-w-6xl">
    <div
      class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <!-- UPLOAD -->
      <section class="border-b border-slate-100 p-5 sm:p-8">
        <h2
          class="flex items-center gap-3 text-xl font-extrabold text-slate-900"
        >
          <Upload :size="23" class="text-blue-600" />
          Upload PDF
        </h2>

        <p class="mt-2 text-sm text-slate-600">
          Choose a PDF document to crop its pages.
        </p>

        <input
          ref="pdfInput"
          type="file"
          accept=".pdf,application/pdf"
          class="sr-only"
          aria-label="Choose PDF file"
          @change="onPdfChange"
        />

        <div
          class="mt-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-10 text-center"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <FileText
            :size="44"
            :stroke-width="1.5"
            class="mx-auto text-blue-600"
          />

          <p class="mt-4 font-bold text-slate-900">Drop your PDF here</p>

          <p class="mt-2 text-sm text-slate-500">
            Or choose a PDF from your device.
          </p>

          <button
            type="button"
            :disabled="busy"
            class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            @click="pdfInput?.click()"
          >
            <Upload :size="18" />
            {{ reading ? "Opening PDF..." : "Choose PDF File" }}
          </button>

          <p class="mt-4 text-xs text-slate-500">
            PDF only · Up to 40 MB · Local processing
          </p>
        </div>

        <div
          v-if="selectedFile"
          class="mt-5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="min-w-0">
            <p class="break-all text-sm font-bold text-slate-900">
              {{ selectedFile.name }}
            </p>

            <p class="mt-1 text-xs text-slate-500">
              {{ totalPages }} pages · {{ fileSize }}
            </p>
          </div>

          <button
            type="button"
            :disabled="busy"
            aria-label="Remove PDF"
            class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            @click="removePdf"
          >
            <X :size="20" />
          </button>
        </div>
      </section>

      <!-- EDITOR -->
      <section
        class="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
      >
        <!-- LEFT: PDF PREVIEW -->
        <div class="min-w-0">
          <h2
            class="flex items-center gap-3 text-xl font-extrabold text-slate-900"
          >
            <Crop :size="23" class="text-blue-600" />
            Select crop area
          </h2>

          <p class="mt-2 text-sm leading-7 text-slate-600">
            Drag on the PDF page to select the area you want to keep. The darker
            area outside the blue rectangle will be hidden.
          </p>

          <!-- PAGE NAVIGATION -->
          <div
            v-if="selectedFile"
            class="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
          >
            <button
              type="button"
              :disabled="busy || currentPage <= 1"
              aria-label="Previous PDF page"
              class="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30"
              @click="changePage(-1)"
            >
              <ChevronLeft :size="20" />
            </button>

            <span class="text-sm font-bold text-slate-800">
              Page {{ currentPage }} of {{ totalPages }}
            </span>

            <button
              type="button"
              :disabled="busy || currentPage >= totalPages"
              aria-label="Next PDF page"
              class="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30"
              @click="changePage(1)"
            >
              <ChevronRight :size="20" />
            </button>
          </div>

          <!-- REAL PDF PREVIEW -->
          <div
            class="mt-5 flex min-h-[380px] items-center justify-center rounded-2xl bg-slate-100 p-4 sm:p-6"
          >
            <div
              v-if="selectedFile"
              class="relative w-full max-w-[600px] overflow-hidden bg-white shadow-lg"
            >
              <canvas ref="previewCanvas" class="block h-auto w-full" />

              <!-- KEEP AREA -->
              <div
                v-if="previewReady"
                class="pointer-events-none absolute z-10 border-2 border-blue-500"
                :style="{
                  ...cropStyle,
                  boxShadow: '0 0 0 9999px rgba(15,23,42,0.45)',
                }"
              >
                <span
                  class="absolute -top-7 left-0 rounded-t-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white"
                >
                  Keep this area
                </span>

                <span
                  v-for="corner in [
                    'top-left',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                  ]"
                  :key="corner"
                  class="absolute h-2.5 w-2.5 rounded-sm border border-blue-600 bg-white"
                  :class="{
                    '-left-1.5 -top-1.5': corner === 'top-left',
                    '-right-1.5 -top-1.5': corner === 'top-right',
                    '-bottom-1.5 -left-1.5': corner === 'bottom-left',
                    '-bottom-1.5 -right-1.5': corner === 'bottom-right',
                  }"
                />
              </div>

              <!-- TOUCH / MOUSE INTERACTION LAYER -->
              <div
                v-if="previewReady"
                class="absolute inset-0 z-20 cursor-crosshair touch-none"
                aria-label="Drag to choose PDF crop area"
                @pointerdown="beginSelection"
                @pointermove="moveSelection"
                @pointerup="endSelection"
                @pointercancel="endSelection"
              />
            </div>

            <div v-else class="py-20 text-center text-slate-400">
              <FileText :size="52" class="mx-auto" />

              <p class="mt-4 text-sm">
                {{
                  reading || rendering
                    ? "Loading PDF preview..."
                    : "Upload a PDF to start cropping."
                }}
              </p>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p class="inline-flex items-center gap-2 text-xs text-slate-500">
              <Move :size="16" />
              Drag to redraw the crop rectangle.
            </p>

            <button
              type="button"
              :disabled="busy"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              @click="resetCrop"
            >
              <RotateCcw :size="16" />
              Reset crop
            </button>
          </div>
        </div>

        <!-- RIGHT: CROP SETTINGS -->
        <div class="min-w-0 space-y-6">
          <div>
            <h2 class="text-xl font-extrabold text-slate-900">Crop settings</h2>

            <p class="mt-2 text-sm leading-7 text-slate-600">
              Adjust margins and choose which pages to crop.
            </p>
          </div>

          <!-- MARGIN CONTROLS -->
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-sm font-extrabold text-slate-900">
              Remove margins (%)
            </h3>

            <p class="mt-2 text-xs leading-6 text-slate-500">
              Percentages refer to the displayed page. Larger margins make the
              kept area smaller.
            </p>

            <div class="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label
                  for="crop-left"
                  class="mb-2 block text-xs font-bold text-slate-700"
                >
                  Left
                </label>

                <input
                  id="crop-left"
                  type="number"
                  min="0"
                  max="95"
                  step="1"
                  :value="margins.left"
                  :disabled="busy"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                  @change="setMargin('left', $event.target.value)"
                />
              </div>

              <div>
                <label
                  for="crop-right"
                  class="mb-2 block text-xs font-bold text-slate-700"
                >
                  Right
                </label>

                <input
                  id="crop-right"
                  type="number"
                  min="0"
                  max="95"
                  step="1"
                  :value="margins.right"
                  :disabled="busy"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                  @change="setMargin('right', $event.target.value)"
                />
              </div>

              <div>
                <label
                  for="crop-top"
                  class="mb-2 block text-xs font-bold text-slate-700"
                >
                  Top
                </label>

                <input
                  id="crop-top"
                  type="number"
                  min="0"
                  max="95"
                  step="1"
                  :value="margins.top"
                  :disabled="busy"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                  @change="setMargin('top', $event.target.value)"
                />
              </div>

              <div>
                <label
                  for="crop-bottom"
                  class="mb-2 block text-xs font-bold text-slate-700"
                >
                  Bottom
                </label>

                <input
                  id="crop-bottom"
                  type="number"
                  min="0"
                  max="95"
                  step="1"
                  :value="margins.bottom"
                  :disabled="busy"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                  @change="setMargin('bottom', $event.target.value)"
                />
              </div>
            </div>
          </div>

          <!-- PAGE RANGE -->
          <div>
            <label
              for="crop-page-range"
              class="mb-2 block text-sm font-bold text-slate-700"
            >
              Pages to crop
            </label>

            <input
              id="crop-page-range"
              v-model="pageRange"
              type="text"
              placeholder="all or 1-3,5"
              :disabled="busy"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p class="mt-2 text-xs text-slate-500">
              Examples: all, 1, 2-5, 1,3,5 or 2-.
            </p>

            <p v-if="selectedPages.error" class="mt-2 text-xs text-red-600">
              {{ selectedPages.error }}
            </p>

            <p
              v-else-if="selectedFile"
              class="mt-2 text-xs font-semibold text-blue-600"
            >
              {{ selectedPages.count }} pages selected
            </p>
          </div>

          <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h3 class="text-sm font-bold text-slate-900">
              Apply the same crop
            </h3>

            <p class="mt-2 text-xs leading-6 text-slate-600">
              The selected rectangle is applied proportionally to every page in
              your chosen range. You can navigate through pages to inspect the
              fit.
            </p>
          </div>

          <div
            class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <ShieldCheck :size="21" class="shrink-0 text-blue-600" />

            <div>
              <h3 class="text-sm font-bold text-slate-900">Local processing</h3>

              <p class="mt-2 text-xs leading-6 text-slate-600">
                Cropping happens in your browser. Your source PDF is not
                uploaded to a document-processing server.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ACTIONS -->
      <section class="border-t border-slate-100 p-5 sm:p-8">
        <div
          v-if="error"
          role="alert"
          class="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle :size="20" class="shrink-0" />
          <span>{{ error }}</span>
        </div>

        <div
          v-if="processing"
          class="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-5"
          role="status"
          aria-live="polite"
        >
          <p class="text-sm font-bold text-slate-700">
            {{ status }} {{ progress }}%
          </p>

          <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              class="h-full bg-blue-600 transition-all"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <button
          type="button"
          :disabled="!canCrop"
          class="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-50"
          @click="generateCroppedPdf"
        >
          <Crop :size="21" />
          {{ processing ? "Cropping PDF..." : "Crop PDF" }}
        </button>

        <!-- SUCCESS -->
        <div
          v-if="downloadUrl"
          class="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center"
          aria-live="polite"
        >
          <CheckCircle2 :size="35" class="mx-auto text-blue-600" />

          <h3 class="mt-3 text-lg font-extrabold text-slate-900">
            Your PDF is ready!
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
            Download Cropped PDF
          </a>
        </div>

        <p class="mt-5 text-center text-xs leading-6 text-slate-500">
          Cropping hides content outside the visible area. It does not securely
          delete that content. Always inspect the downloaded PDF.
        </p>
      </section>
    </div>
  </div>
</template>
