<script setup>
import { ref, reactive, computed, watch, nextTick, onBeforeUnmount } from "vue";

import {
  Upload,
  FileText,
  PenLine,
  Image as ImageIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Move,
} from "@lucide/vue";

import {
  signPdfFile,
  validateSignaturePdf,
  validateSignatureImage,
} from "~/utils/pdf/signPdf.mjs";

// ----------------------------------------
// STATE
// ----------------------------------------
const pdfInput = ref(null);
const imageInput = ref(null);
const drawingCanvas = ref(null);
const previewCanvas = ref(null);
const previewHolder = ref(null);

const pdfFile = ref(null);
const totalPages = ref(0);
const currentPage = ref(1);

const reading = ref(false);
const rendering = ref(false);
const signing = ref(false);
const previewReady = ref(false);

const error = ref("");
const success = ref("");

const outputUrl = ref("");
const outputName = ref("");

const signatureMode = ref("draw");

// Drawn signature
const drawnSignature = ref("");
const drawnWidth = ref(0);
const drawnHeight = ref(0);

// Uploaded signature
const imageFile = ref(null);
const imageUrl = ref("");
const imageWidth = ref(0);
const imageHeight = ref(0);

// Signature placement, relative to PDF preview.
const position = reactive({
  x: 0.32,
  y: 0.78,
});

// Signature width as a percentage of the page.
const signatureWidth = ref(36);

const pageSize = reactive({
  width: 612,
  height: 792,
});

let pdfLoadingTask = null;
let pdfDocument = null;
let renderTask = null;

let drawing = false;
let drawingPointerId = null;
let dragState = null;

const busy = computed(() => reading.value || rendering.value || signing.value);

const signatureSrc = computed(() => {
  return signatureMode.value === "draw" ? drawnSignature.value : imageUrl.value;
});

const signatureDimensions = computed(() => {
  return signatureMode.value === "draw"
    ? {
        width: drawnWidth.value,
        height: drawnHeight.value,
      }
    : {
        width: imageWidth.value,
        height: imageHeight.value,
      };
});

const hasSignature = computed(() => {
  return Boolean(
    signatureSrc.value &&
    signatureDimensions.value.width > 0 &&
    signatureDimensions.value.height > 0,
  );
});

// Keep the signature inside the visible PDF page.
const effectiveWidth = computed(() => {
  if (!hasSignature.value) return 0;

  const dims = signatureDimensions.value;

  const maxWidthForHeight =
    (pageSize.height * 0.9 * dims.width) / (pageSize.width * dims.height);

  return Math.max(
    0.001,
    Math.min(signatureWidth.value / 100, 0.85, maxWidthForHeight),
  );
});

const effectiveHeight = computed(() => {
  if (!hasSignature.value) return 0;

  const dims = signatureDimensions.value;

  return (
    effectiveWidth.value *
    (pageSize.width / pageSize.height) *
    (dims.height / dims.width)
  );
});

const safeX = computed(() =>
  Math.max(0, Math.min(position.x, 1 - effectiveWidth.value)),
);

const safeY = computed(() =>
  Math.max(0, Math.min(position.y, 1 - effectiveHeight.value)),
);

const overlayStyle = computed(() => ({
  left: `${safeX.value * 100}%`,
  top: `${safeY.value * 100}%`,
  width: `${effectiveWidth.value * 100}%`,
  aspectRatio:
    `${signatureDimensions.value.width} / ` +
    `${signatureDimensions.value.height}`,
}));

const canSign = computed(() => {
  return (
    Boolean(pdfFile.value) &&
    Boolean(totalPages.value) &&
    hasSignature.value &&
    previewReady.value &&
    !busy.value
  );
});

// ----------------------------------------
// GENERAL HELPERS
// ----------------------------------------
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clearOutput() {
  if (outputUrl.value) {
    URL.revokeObjectURL(outputUrl.value);
  }

  outputUrl.value = "";
  outputName.value = "";
  success.value = "";
}

watch(
  [
    signatureMode,
    drawnSignature,
    imageFile,
    signatureWidth,
    currentPage,
    () => position.x,
    () => position.y,
  ],
  clearOutput,
);

watch([effectiveWidth, effectiveHeight], () => {
  position.x = safeX.value;
  position.y = safeY.value;
});

// ----------------------------------------
// PDF LOADING AND PREVIEW
// ----------------------------------------
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
    try {
      renderTask.cancel();
      await renderTask.promise;
    } catch {
      // Rendering was cancelled.
    }

    renderTask = null;
  }

  if (pdfLoadingTask) {
    try {
      await pdfLoadingTask.destroy();
    } catch {
      // Document already closed.
    }
  }

  pdfLoadingTask = null;
  pdfDocument = null;
}

async function renderCurrentPage() {
  if (!pdfDocument || !previewCanvas.value) return;

  rendering.value = true;
  previewReady.value = false;

  let page = null;

  try {
    page = await pdfDocument.getPage(currentPage.value);

    const originalViewport = page.getViewport({
      scale: 1,
    });

    const maxScale = Math.sqrt(
      2_000_000 / (originalViewport.width * originalViewport.height),
    );

    const viewport = page.getViewport({
      scale: Math.min(1.5, maxScale),
    });

    const canvas = previewCanvas.value;

    canvas.width = Math.max(1, Math.floor(viewport.width));

    canvas.height = Math.max(1, Math.floor(viewport.height));

    const context = canvas.getContext("2d", {
      alpha: false,
    });

    if (!context) {
      throw new Error("Unable to render PDF preview.");
    }

    pageSize.width = originalViewport.width;
    pageSize.height = originalViewport.height;

    renderTask = page.render({
      canvasContext: context,
      canvas,
      viewport,
    });

    await renderTask.promise;

    previewReady.value = true;
  } catch (err) {
    console.error("PDF preview failed:", err);

    error.value = err?.message || "Cannot render this PDF page.";
  } finally {
    renderTask = null;
    page?.cleanup();
    rendering.value = false;
  }
}

async function loadPdf(file) {
  if (!file || busy.value) return;

  error.value = "";
  clearOutput();

  reading.value = true;

  await releasePdf();

  pdfFile.value = null;
  totalPages.value = 0;

  try {
    validateSignaturePdf(file);

    const pdfjs = await loadPdfJs();

    const data = new Uint8Array(await file.arrayBuffer());

    pdfLoadingTask = pdfjs.getDocument({ data });
    pdfDocument = await pdfLoadingTask.promise;

    if (!pdfDocument.numPages) {
      throw new Error("The PDF contains no pages.");
    }

    totalPages.value = pdfDocument.numPages;

    // Signature pages are often at the end.
    currentPage.value = totalPages.value;

    pdfFile.value = file;

    await nextTick();
    await renderCurrentPage();
  } catch (err) {
    console.error("PDF loading failed:", err);

    error.value =
      err?.name === "PasswordException"
        ? "Password-protected PDFs are not supported."
        : err?.message || "Unable to open this PDF.";

    await releasePdf();

    pdfFile.value = null;
    totalPages.value = 0;
  } finally {
    reading.value = false;
  }
}

function onPdfChange(event) {
  const file = event.target.files?.[0];

  if (file) {
    void loadPdf(file);
  }

  event.target.value = "";
}

function onPdfDrop(event) {
  event.preventDefault();

  const file = event.dataTransfer?.files?.[0];

  if (file && !busy.value) {
    void loadPdf(file);
  }
}

async function changePage(offset) {
  if (busy.value || !pdfFile.value) return;

  const next = currentPage.value + offset;

  if (next < 1 || next > totalPages.value) return;

  error.value = "";
  currentPage.value = next;

  await renderCurrentPage();
}

// ----------------------------------------
// DRAW SIGNATURE
// ----------------------------------------
function drawingPoint(event) {
  const canvas = drawingCanvas.value;
  const bounds = canvas.getBoundingClientRect();

  return {
    x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
    y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
  };
}

function beginDrawing(event) {
  if (busy.value || event.button > 0) return;

  event.preventDefault();

  const canvas = drawingCanvas.value;
  const ctx = canvas.getContext("2d");
  const point = drawingPoint(event);

  drawnSignature.value = "";

  drawing = true;
  drawingPointerId = event.pointerId;

  canvas.setPointerCapture(event.pointerId);

  ctx.strokeStyle = "#172554";
  ctx.fillStyle = "#172554";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Draw a dot even if the user only taps.
  ctx.beginPath();
  ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
}

function moveDrawing(event) {
  if (!drawing || event.pointerId !== drawingPointerId) {
    return;
  }

  event.preventDefault();

  const ctx = drawingCanvas.value.getContext("2d");
  const point = drawingPoint(event);

  ctx.lineTo(point.x, point.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
}

// Crop transparent whitespace around the signature.
function captureDrawing() {
  const source = drawingCanvas.value;
  const ctx = source.getContext("2d");

  const pixels = ctx.getImageData(0, 0, source.width, source.height);

  let minX = source.width;
  let minY = source.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const alpha = pixels.data[(y * source.width + x) * 4 + 3];

      if (alpha > 10) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0 || maxY < 0) return;

  const padding = 18;

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;

  const cropped = document.createElement("canvas");

  cropped.width = cropWidth + padding * 2;
  cropped.height = cropHeight + padding * 2;

  const croppedCtx = cropped.getContext("2d");

  croppedCtx.drawImage(
    source,
    minX,
    minY,
    cropWidth,
    cropHeight,
    padding,
    padding,
    cropWidth,
    cropHeight,
  );

  drawnWidth.value = cropped.width;
  drawnHeight.value = cropped.height;

  drawnSignature.value = cropped.toDataURL("image/png");
}

function endDrawing(event) {
  if (!drawing || event.pointerId !== drawingPointerId) {
    return;
  }

  drawing = false;
  drawingPointerId = null;

  captureDrawing();
}

function clearDrawing() {
  if (busy.value) return;

  const canvas = drawingCanvas.value;

  canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);

  drawnSignature.value = "";
  drawnWidth.value = 0;
  drawnHeight.value = 0;

  clearOutput();
}

// ----------------------------------------
// UPLOAD SIGNATURE IMAGE
// ----------------------------------------
function chooseImage() {
  if (!busy.value) imageInput.value?.click();
}

async function loadImage(file) {
  if (busy.value) return;

  error.value = "";

  let temporaryUrl = "";

  try {
    validateSignatureImage(file);

    temporaryUrl = URL.createObjectURL(file);

    const dimensions = await new Promise((resolve, reject) => {
      const image = new window.Image();

      image.onload = () =>
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });

      image.onerror = () =>
        reject(new Error("Cannot read this signature image."));

      image.src = temporaryUrl;
    });

    if (!dimensions.width || !dimensions.height) {
      throw new Error("Invalid image dimensions.");
    }

    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value);
    }

    imageFile.value = file;
    imageUrl.value = temporaryUrl;
    imageWidth.value = dimensions.width;
    imageHeight.value = dimensions.height;

    clearOutput();
  } catch (err) {
    if (temporaryUrl) {
      URL.revokeObjectURL(temporaryUrl);
    }

    error.value = err?.message || "Cannot load signature image.";
  }
}

function onImageChange(event) {
  const file = event.target.files?.[0];

  if (file) void loadImage(file);

  event.target.value = "";
}

// ----------------------------------------
// POSITION THE SIGNATURE
// ----------------------------------------
function placeOnClick(event) {
  if (!hasSignature.value || busy.value) return;

  const bounds = previewHolder.value.getBoundingClientRect();

  const x = (event.clientX - bounds.left) / bounds.width;

  const y = (event.clientY - bounds.top) / bounds.height;

  position.x = clamp(x - effectiveWidth.value / 2, 0, 1 - effectiveWidth.value);

  position.y = clamp(
    y - effectiveHeight.value / 2,
    0,
    1 - effectiveHeight.value,
  );
}

function startDrag(event) {
  if (busy.value || event.button > 0) return;

  event.preventDefault();
  event.stopPropagation();

  dragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    x: safeX.value,
    y: safeY.value,
  };

  event.currentTarget.setPointerCapture(event.pointerId);
}

function moveDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  event.preventDefault();

  const bounds = previewHolder.value.getBoundingClientRect();

  const dx = (event.clientX - dragState.startX) / bounds.width;

  const dy = (event.clientY - dragState.startY) / bounds.height;

  position.x = clamp(dragState.x + dx, 0, 1 - effectiveWidth.value);

  position.y = clamp(dragState.y + dy, 0, 1 - effectiveHeight.value);
}

function finishDrag() {
  dragState = null;
}

// ----------------------------------------
// SIGN AND DOWNLOAD
// ----------------------------------------
async function generateSignedPdf() {
  if (!canSign.value) return;

  error.value = "";
  clearOutput();

  signing.value = true;

  await nextTick();

  try {
    const result = await signPdfFile(pdfFile.value, {
      pageNumber: currentPage.value,

      signatureDataUrl:
        signatureMode.value === "draw" ? drawnSignature.value : null,

      signatureFile: signatureMode.value === "upload" ? imageFile.value : null,

      placement: {
        x: safeX.value,
        y: safeY.value,
        width: effectiveWidth.value,
      },
    });

    const blob = new Blob([result.bytes], {
      type: "application/pdf",
    });

    outputUrl.value = URL.createObjectURL(blob);

    outputName.value = result.fileName;

    success.value =
      `Signature added to page ${result.pageNumber} ` +
      `of ${result.totalPages}.`;
  } catch (err) {
    console.error("Sign PDF failed:", err);

    error.value = err?.message || "Unable to sign this PDF.";
  } finally {
    signing.value = false;
  }
}

onBeforeUnmount(() => {
  clearOutput();

  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }

  // Release PDF.js worker and its resources.
  void releasePdf();
});
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div
      class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <!-- PDF UPLOAD -->
      <section class="border-b border-slate-100 p-5 sm:p-8">
        <h2 class="text-xl font-extrabold text-slate-900">Upload your PDF</h2>

        <p class="mt-2 text-sm text-slate-600">
          Choose the document you want to sign.
        </p>

        <input
          ref="pdfInput"
          type="file"
          accept=".pdf,application/pdf"
          class="sr-only"
          @change="onPdfChange"
        />

        <div
          class="mt-5 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-9 text-center"
          @dragover.prevent
          @drop.prevent="onPdfDrop"
        >
          <FileText :size="42" class="mx-auto text-blue-600" />

          <p class="mt-3 font-bold text-slate-900">Select or drop a PDF</p>

          <button
            type="button"
            :disabled="busy"
            class="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            @click="pdfInput?.click()"
          >
            <Upload :size="18" />
            {{ reading ? "Opening PDF..." : "Choose PDF" }}
          </button>

          <p class="mt-3 text-xs text-slate-500">
            PDF only · Maximum 40 MB · Local processing
          </p>
        </div>

        <div
          v-if="pdfFile"
          class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <p class="break-all text-sm font-bold text-slate-900">
            {{ pdfFile.name }}
          </p>

          <p class="mt-1 text-xs text-slate-500">{{ totalPages }} pages</p>
        </div>
      </section>

      <!-- TWO-COLUMN EDITOR -->
      <section
        class="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      >
        <!-- LEFT: SIGNATURE -->
        <div class="min-w-0 space-y-6">
          <div>
            <h2
              class="flex items-center gap-2 text-xl font-extrabold text-slate-900"
            >
              <PenLine :size="23" class="text-blue-600" />
              Your signature
            </h2>

            <p class="mt-2 text-sm text-slate-600">
              Draw a signature or upload an existing image.
            </p>
          </div>

          <!-- MODE SWITCH -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold"
              :class="
                signatureMode === 'draw'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600'
              "
              :aria-pressed="signatureMode === 'draw'"
              :disabled="busy"
              @click="signatureMode = 'draw'"
            >
              <PenLine :size="18" />
              Draw
            </button>

            <button
              type="button"
              class="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold"
              :class="
                signatureMode === 'upload'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600'
              "
              :aria-pressed="signatureMode === 'upload'"
              :disabled="busy"
              @click="signatureMode = 'upload'"
            >
              <ImageIcon :size="18" />
              Upload image
            </button>
          </div>

          <!-- DRAW MODE -->
          <div v-show="signatureMode === 'draw'">
            <div class="rounded-2xl border border-slate-200 bg-white p-3">
              <canvas
                ref="drawingCanvas"
                width="900"
                height="240"
                aria-label="Draw your signature here"
                class="block w-full touch-none rounded-xl bg-slate-50"
                @pointerdown="beginDrawing"
                @pointermove="moveDrawing"
                @pointerup="endDrawing"
                @pointercancel="endDrawing"
              />

              <p class="mt-3 text-xs text-slate-500">
                Use a mouse, finger, or stylus to sign.
              </p>
            </div>

            <button
              type="button"
              class="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              :disabled="busy"
              @click="clearDrawing"
            >
              <Trash2 :size="17" />
              Clear drawing
            </button>
          </div>

          <!-- UPLOAD MODE -->
          <div v-show="signatureMode === 'upload'">
            <input
              ref="imageInput"
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              class="sr-only"
              @change="onImageChange"
            />

            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-6 text-sm font-bold text-blue-700"
              :disabled="busy"
              @click="chooseImage"
            >
              <Upload :size="19" />
              Upload PNG or JPG signature
            </button>

            <div
              v-if="imageUrl"
              class="mt-4 rounded-xl border border-slate-200 p-4"
            >
              <img
                :src="imageUrl"
                alt="Uploaded signature"
                class="mx-auto max-h-28 max-w-full object-contain"
              />

              <p class="mt-3 break-all text-center text-xs text-slate-500">
                {{ imageFile?.name }}
              </p>
            </div>

            <p class="mt-3 text-xs text-slate-500">
              Transparent PNG works best. Maximum 5 MB.
            </p>
          </div>

          <!-- SIZE CONTROL -->
          <div>
            <div class="mb-2 flex justify-between gap-2">
              <label
                for="signature-size"
                class="text-sm font-bold text-slate-700"
              >
                Signature size
              </label>

              <span class="text-sm font-bold text-blue-600">
                {{ signatureWidth }}%
              </span>
            </div>

            <input
              id="signature-size"
              v-model.number="signatureWidth"
              type="range"
              min="10"
              max="70"
              step="2"
              class="w-full accent-blue-600"
              :disabled="busy"
            />

            <p class="mt-2 text-xs text-slate-500">
              Very tall signatures are automatically reduced to fit the page.
            </p>
          </div>

          <div
            class="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4"
          >
            <Move :size="21" class="shrink-0 text-blue-600" />

            <p class="text-sm leading-6 text-slate-600">
              Click the page preview to place the signature, or drag the
              signature to reposition it.
            </p>
          </div>
        </div>

        <!-- RIGHT: PDF PREVIEW -->
        <div class="min-w-0">
          <h2 class="text-xl font-extrabold text-slate-900">
            Position signature
          </h2>

          <p class="mt-2 text-sm text-slate-600">
            Preview the actual PDF page before signing.
          </p>

          <!-- PAGE NAVIGATION -->
          <div
            v-if="pdfFile"
            class="mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-3"
          >
            <button
              type="button"
              class="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30"
              :disabled="busy || currentPage <= 1"
              aria-label="Previous page"
              @click="changePage(-1)"
            >
              <ChevronLeft :size="20" />
            </button>

            <span class="text-sm font-bold text-slate-800">
              Page {{ currentPage }} of {{ totalPages }}
            </span>

            <button
              type="button"
              class="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30"
              :disabled="busy || currentPage >= totalPages"
              aria-label="Next page"
              @click="changePage(1)"
            >
              <ChevronRight :size="20" />
            </button>
          </div>

          <!-- ACTUAL PAGE PREVIEW -->
          <div
            class="mt-4 flex min-h-[330px] items-center justify-center rounded-2xl bg-slate-100 p-3 sm:p-5"
          >
            <div
              v-if="pdfFile"
              ref="previewHolder"
              class="relative w-full max-w-[600px] overflow-hidden bg-white shadow-lg"
              @click="placeOnClick"
            >
              <canvas ref="previewCanvas" class="block h-auto w-full" />

              <!-- SIGNATURE OVERLAY -->
              <div
                v-if="previewReady && hasSignature"
                class="absolute z-10 cursor-grab touch-none select-none outline-2 outline-dashed outline-blue-500 outline-offset-1 active:cursor-grabbing"
                :style="overlayStyle"
                role="img"
                aria-label="Draggable signature preview"
                @click.stop
                @pointerdown="startDrag"
                @pointermove="moveDrag"
                @pointerup="finishDrag"
                @pointercancel="finishDrag"
              >
                <img
                  :src="signatureSrc"
                  alt=""
                  draggable="false"
                  class="pointer-events-none block h-full w-full"
                />
              </div>
            </div>

            <div v-else class="py-16 text-center text-slate-400">
              <FileText :size="50" class="mx-auto" />

              <p class="mt-4 text-sm">Upload a PDF to see its pages.</p>
            </div>
          </div>

          <p v-if="rendering" class="mt-3 text-center text-xs text-slate-500">
            Rendering PDF page...
          </p>

          <div
            class="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-4"
          >
            <ShieldCheck :size="22" class="shrink-0 text-blue-600" />

            <p class="text-xs leading-6 text-slate-600">
              Your PDF and signature are processed locally in your browser,
              without uploading the document to our server.
            </p>
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
          {{ error }}
        </div>

        <button
          type="button"
          :disabled="!canSign"
          class="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="generateSignedPdf"
        >
          <PenLine :size="21" />
          {{ signing ? "Signing PDF..." : "Add Signature to PDF" }}
        </button>

        <!-- DOWNLOAD -->
        <div
          v-if="outputUrl"
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
            :href="outputUrl"
            :download="outputName"
            class="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-700"
          >
            <Download :size="19" />
            Download Signed PDF
          </a>
        </div>

        <p class="mt-5 text-center text-xs leading-6 text-slate-500">
          This tool adds a visual signature, not a certificate-based digital
          signature. Always review the resulting document.
        </p>
      </section>
    </div>
  </div>
</template>
