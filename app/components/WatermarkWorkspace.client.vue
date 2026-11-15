<script setup>
import { ref, reactive, computed, watch, nextTick, onBeforeUnmount } from "vue";

import { PDFDocument } from "pdf-lib";

import {
  Upload,
  FileText,
  Image,
  Type,
  Download,
  ShieldCheck,
  X,
  Stamp,
  CheckCircle2,
  AlertCircle,
} from "@lucide/vue";

import {
  addWatermarkToPdf,
  parseWatermarkPageRange,
} from "~/utils/pdf/watermark.mjs";

const MAX_PDF_SIZE = 40 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const pdfInput = ref(null);
const imageInput = ref(null);

const selectedPdf = ref(null);
const selectedImage = ref(null);

const pageCount = ref(0);

const readingPdf = ref(false);
const processing = ref(false);

const error = ref("");
const success = ref("");

const downloadUrl = ref("");
const downloadName = ref("");
const imagePreviewUrl = ref("");

const form = reactive({
  mode: "text",
  text: "CONFIDENTIAL",
  pageRange: "all",
  position: "center",
  rotation: -30,
  opacity: 25,
  fontSize: 48,
  imageScale: 45,
  color: "#64748b",
});

const positions = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "middle-left", label: "Middle left" },
  { value: "center", label: "Center" },
  { value: "middle-right", label: "Middle right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

const busy = computed(() => readingPdf.value || processing.value);

const rangeStatus = computed(() => {
  if (!pageCount.value) {
    return { count: 0, error: "" };
  }

  try {
    const indexes = parseWatermarkPageRange(form.pageRange, pageCount.value);

    return {
      count: indexes.length,
      error: "",
    };
  } catch (err) {
    return {
      count: 0,
      error: err.message,
    };
  }
});

const canProcess = computed(() => {
  if (!selectedPdf.value || busy.value) return false;

  if (rangeStatus.value.error) return false;

  if (form.mode === "text") {
    return form.text.trim().length > 0 && form.text.length <= 120;
  }

  return Boolean(selectedImage.value);
});

const fileSize = computed(() => {
  if (!selectedPdf.value) return "";

  return (selectedPdf.value.size / 1024 / 1024).toFixed(2) + " MB";
});

function clearDownload() {
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value);
  }

  downloadUrl.value = "";
  downloadName.value = "";
  success.value = "";
}

function clearImagePreview() {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }

  imagePreviewUrl.value = "";
}

watch(
  form,
  () => {
    clearDownload();
  },
  { deep: true },
);

function openPdfPicker() {
  if (!busy.value) {
    pdfInput.value?.click();
  }
}

function openImagePicker() {
  if (!busy.value) {
    imageInput.value?.click();
  }
}

async function loadPdf(file) {
  if (!file || busy.value) return;

  error.value = "";
  clearDownload();

  selectedPdf.value = null;
  pageCount.value = 0;

  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  if (!isPdf) {
    error.value = "Please choose a valid PDF file.";
    return;
  }

  if (file.size === 0 || file.size > MAX_PDF_SIZE) {
    error.value = "Choose a PDF smaller than 40 MB.";
    return;
  }

  readingPdf.value = true;

  try {
    const bytes = await file.arrayBuffer();

    const pdf = await PDFDocument.load(bytes, {
      updateMetadata: false,
    });

    const count = pdf.getPageCount();

    if (!count) {
      throw new Error("The PDF has no pages.");
    }

    selectedPdf.value = file;
    pageCount.value = count;
    form.pageRange = "all";
  } catch (err) {
    console.error("PDF loading failed:", err);

    error.value =
      "Cannot open this PDF. It may be damaged, " +
      "password-protected or unsupported.";
  } finally {
    readingPdf.value = false;
  }
}

function onPdfChange(event) {
  const file = event.target.files?.[0];

  if (file) {
    void loadPdf(file);
  }

  event.target.value = "";
}

function onDrop(event) {
  event.preventDefault();

  if (busy.value) return;

  const file = event.dataTransfer?.files?.[0];

  if (file) {
    void loadPdf(file);
  }
}

function removePdf() {
  if (busy.value) return;

  clearDownload();

  selectedPdf.value = null;
  pageCount.value = 0;
  error.value = "";
  form.pageRange = "all";

  if (pdfInput.value) {
    pdfInput.value.value = "";
  }
}

function loadImage(file) {
  if (!file || busy.value) return;

  error.value = "";
  clearDownload();
  clearImagePreview();

  selectedImage.value = null;

  const accepted =
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    /\.(png|jpe?g)$/i.test(file.name);

  if (!accepted) {
    error.value = "Choose a PNG or JPG image for the watermark.";
    return;
  }

  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    error.value = "Watermark images must be smaller than 10 MB.";
    return;
  }

  selectedImage.value = file;

  imagePreviewUrl.value = URL.createObjectURL(file);
}

function onImageChange(event) {
  const file = event.target.files?.[0];

  if (file) {
    loadImage(file);
  }

  event.target.value = "";
}

function removeImage() {
  if (busy.value) return;

  clearImagePreview();
  clearDownload();

  selectedImage.value = null;

  if (imageInput.value) {
    imageInput.value.value = "";
  }
}

function setMode(mode) {
  if (busy.value) return;

  form.mode = mode;
  error.value = "";
}

async function generateWatermark() {
  error.value = "";
  clearDownload();

  if (!canProcess.value) {
    error.value = "Please select a PDF and complete the watermark settings.";
    return;
  }

  processing.value = true;

  await nextTick();

  try {
    const result = await addWatermarkToPdf(selectedPdf.value, {
      mode: form.mode,
      text: form.text,
      imageFile: selectedImage.value,
      pageRange: form.pageRange,
      position: form.position,
      rotation: form.rotation,
      opacity: form.opacity,
      fontSize: form.fontSize,
      imageScale: form.imageScale,
      color: form.color,
    });

    const blob = new Blob([result.bytes], {
      type: "application/pdf",
    });

    downloadUrl.value = URL.createObjectURL(blob);

    const originalName = selectedPdf.value.name.replace(/\.pdf$/i, "");

    downloadName.value = `${originalName}-watermarked.pdf`;

    success.value =
      `Watermark added to ${result.watermarkedPages} ` +
      `of ${result.totalPages} pages.`;
  } catch (err) {
    console.error("Watermark processing error:", err);

    error.value = err?.message || "Unable to watermark this PDF.";
  } finally {
    processing.value = false;
  }
}

onBeforeUnmount(() => {
  clearDownload();
  clearImagePreview();
});
</script>

<template>
  <div class="mx-auto w-full max-w-6xl">
    <div
      class="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
    >
      <!-- PDF UPLOAD -->
      <section class="border-b border-slate-100 p-5 sm:p-8">
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
          >
            <Upload :size="23" />
          </div>

          <div>
            <h2 class="text-xl font-extrabold text-slate-900">
              Upload your PDF
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Select a document to watermark.
            </p>
          </div>
        </div>

        <input
          ref="pdfInput"
          type="file"
          accept=".pdf,application/pdf"
          class="sr-only"
          aria-label="Choose PDF file"
          @change="onPdfChange"
        />

        <div
          class="mt-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-10 text-center transition hover:border-blue-400"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <FileText
            :size="42"
            class="mx-auto text-blue-500"
            :stroke-width="1.5"
          />

          <p class="mt-4 font-bold text-slate-900">
            Drag and drop your PDF here
          </p>

          <p class="mt-2 text-sm text-slate-500">
            Or choose a document from your device.
          </p>

          <button
            type="button"
            class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            :disabled="busy"
            @click="openPdfPicker"
          >
            <Upload :size="17" />

            {{ readingPdf ? "Reading PDF..." : "Choose PDF File" }}
          </button>

          <p class="mt-4 text-xs text-slate-500">
            PDF only · Maximum 40 MB · Local processing
          </p>
        </div>

        <!-- SELECTED FILE -->
        <div
          v-if="selectedPdf"
          class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="flex min-w-0 items-center gap-3">
            <FileText :size="25" class="shrink-0 text-blue-600" />

            <div class="min-w-0">
              <p class="break-all text-sm font-bold text-slate-900">
                {{ selectedPdf.name }}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                {{ pageCount }} pages · {{ fileSize }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove selected PDF"
            :disabled="busy"
            @click="removePdf"
          >
            <X :size="20" />
          </button>
        </div>
      </section>

      <!-- WATERMARK SETTINGS -->
      <section class="p-5 sm:p-8">
        <div class="flex items-center gap-3">
          <Stamp :size="25" class="text-blue-600" />

          <div>
            <h2 class="text-xl font-extrabold text-slate-900">
              Customize watermark
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Choose your watermark style and placement.
            </p>
          </div>
        </div>

        <div
          class="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
        >
          <!-- LEFT: CONTROLS -->
          <div class="min-w-0 space-y-6">
            <!-- TYPE SELECTOR -->
            <div>
              <label class="mb-3 block text-sm font-bold text-slate-700">
                Watermark type
              </label>

              <div
                class="grid grid-cols-2 gap-3"
                role="group"
                aria-label="Watermark type"
              >
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition"
                  :aria-pressed="form.mode === 'text'"
                  :class="
                    form.mode === 'text'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  "
                  :disabled="busy"
                  @click="setMode('text')"
                >
                  <Type :size="19" />
                  Text
                </button>

                <button
                  type="button"
                  class="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition"
                  :aria-pressed="form.mode === 'image'"
                  :class="
                    form.mode === 'image'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  "
                  :disabled="busy"
                  @click="setMode('image')"
                >
                  <Image :size="19" />
                  Image / Logo
                </button>
              </div>
            </div>

            <!-- TEXT WATERMARK -->
            <div v-if="form.mode === 'text'" class="space-y-5">
              <div>
                <label
                  for="watermark-text"
                  class="mb-2 block text-sm font-bold text-slate-700"
                >
                  Watermark text
                </label>

                <input
                  id="watermark-text"
                  v-model="form.text"
                  type="text"
                  maxlength="120"
                  placeholder="CONFIDENTIAL"
                  class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p class="mt-2 text-xs text-slate-500">
                  Supports standard Latin text. For Khmer, use a PNG image
                  watermark.
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    for="watermark-font-size"
                    class="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Font size
                  </label>

                  <input
                    id="watermark-font-size"
                    v-model.number="form.fontSize"
                    type="number"
                    min="12"
                    max="120"
                    class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    for="watermark-color"
                    class="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Text color
                  </label>

                  <input
                    id="watermark-color"
                    v-model="form.color"
                    type="color"
                    class="h-[46px] w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-2"
                  />
                </div>
              </div>
            </div>

            <!-- IMAGE WATERMARK -->
            <div v-else class="space-y-4">
              <input
                ref="imageInput"
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                class="sr-only"
                aria-label="Choose watermark image"
                @change="onImageChange"
              />

              <button
                type="button"
                class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-7 text-sm font-bold text-blue-700 transition hover:border-blue-400"
                :disabled="busy"
                @click="openImagePicker"
              >
                <Image :size="21" />
                Choose PNG or JPG
              </button>

              <p class="text-xs text-slate-500">
                Transparent PNG images work best for logos. Maximum image size:
                10 MB.
              </p>

              <div
                v-if="selectedImage"
                class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <span class="min-w-0 truncate text-sm text-slate-700">
                  {{ selectedImage.name }}
                </span>

                <button
                  type="button"
                  class="text-sm font-bold text-red-600 hover:underline"
                  @click="removeImage"
                >
                  Remove
                </button>
              </div>

              <div>
                <label
                  for="watermark-image-size"
                  class="mb-2 block text-sm font-bold text-slate-700"
                >
                  Image width: {{ form.imageScale }}%
                </label>

                <input
                  id="watermark-image-size"
                  v-model.number="form.imageScale"
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  class="w-full accent-blue-600"
                />
              </div>
            </div>

            <!-- PAGE RANGE -->
            <div>
              <label
                for="watermark-pages"
                class="mb-2 block text-sm font-bold text-slate-700"
              >
                Pages to watermark
              </label>

              <input
                id="watermark-pages"
                v-model="form.pageRange"
                type="text"
                placeholder="all or 1-3,5"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <p class="mt-2 text-xs text-slate-500">
                Examples: all, 1-3, 2-5,8 or 2-.
              </p>

              <p v-if="rangeStatus.error" class="mt-2 text-xs text-red-600">
                {{ rangeStatus.error }}
              </p>

              <p
                v-else-if="selectedPdf"
                class="mt-2 text-xs font-medium text-blue-600"
              >
                {{ rangeStatus.count }} pages selected
              </p>
            </div>

            <!-- POSITION -->
            <div>
              <label class="mb-3 block text-sm font-bold text-slate-700">
                Watermark position
              </label>

              <div
                class="grid grid-cols-3 gap-2"
                role="group"
                aria-label="Watermark position"
              >
                <button
                  v-for="item in positions"
                  :key="item.value"
                  type="button"
                  :aria-pressed="form.position === item.value"
                  class="min-h-[48px] rounded-xl border px-2 py-2 text-xs font-semibold transition"
                  :class="
                    form.position === item.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
                  "
                  @click="form.position = item.value"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <!-- ROTATION -->
            <div>
              <div class="mb-2 flex items-center justify-between gap-2">
                <label
                  for="watermark-rotation"
                  class="text-sm font-bold text-slate-700"
                >
                  Rotation
                </label>

                <span class="text-sm font-bold text-blue-600">
                  {{ form.rotation }}°
                </span>
              </div>

              <input
                id="watermark-rotation"
                v-model.number="form.rotation"
                type="range"
                min="-90"
                max="90"
                step="5"
                class="w-full accent-blue-600"
              />

              <div class="mt-1 flex justify-between text-xs text-slate-400">
                <span>-90°</span>
                <span>0°</span>
                <span>90°</span>
              </div>
            </div>

            <!-- OPACITY -->
            <div>
              <div class="mb-2 flex items-center justify-between gap-2">
                <label
                  for="watermark-opacity"
                  class="text-sm font-bold text-slate-700"
                >
                  Opacity
                </label>

                <span class="text-sm font-bold text-blue-600">
                  {{ form.opacity }}%
                </span>
              </div>

              <input
                id="watermark-opacity"
                v-model.number="form.opacity"
                type="range"
                min="5"
                max="100"
                step="5"
                class="w-full accent-blue-600"
              />

              <div class="mt-1 flex justify-between text-xs text-slate-400">
                <span>Light</span>
                <span>Solid</span>
              </div>
            </div>
          </div>

          <!-- RIGHT: ILLUSTRATIVE PREVIEW -->
          <div class="min-w-0">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 class="font-extrabold text-slate-900">Watermark preview</h3>

              <p class="mt-1 text-xs leading-5 text-slate-500">
                Position illustration — not a rendered preview of your uploaded
                PDF.
              </p>

              <div
                class="mt-6 flex items-center justify-center rounded-xl bg-slate-100 px-5 py-7"
              >
                <div
                  class="relative aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-sm border border-slate-200 bg-white shadow-lg"
                >
                  <!-- REPRESENTATIVE DOCUMENT CONTENT -->
                  <div
                    class="absolute inset-x-7 top-10 space-y-3"
                    aria-hidden="true"
                  >
                    <div class="h-2 w-3/4 rounded bg-slate-200"></div>

                    <div class="h-2 w-full rounded bg-slate-100"></div>

                    <div class="h-2 w-5/6 rounded bg-slate-100"></div>

                    <div class="h-2 w-full rounded bg-slate-100"></div>

                    <div class="mt-6 h-2 w-4/5 rounded bg-slate-100"></div>

                    <div class="h-2 w-full rounded bg-slate-100"></div>

                    <div class="h-2 w-3/4 rounded bg-slate-100"></div>
                  </div>

                  <!-- 3 BY 3 POSITION GRID -->
                  <div class="absolute inset-4 grid grid-cols-3 grid-rows-3">
                    <div
                      v-for="item in positions"
                      :key="item.value"
                      class="flex items-center justify-center"
                    >
                      <div
                        v-if="form.position === item.value"
                        class="flex shrink-0 items-center justify-center"
                        :style="{
                          opacity: form.opacity / 100,
                          transform: `rotate(${-form.rotation}deg)`,
                          color: form.color,
                        }"
                      >
                        <img
                          v-if="form.mode === 'image' && imagePreviewUrl"
                          :src="imagePreviewUrl"
                          alt="Selected watermark"
                          class="max-h-16 max-w-24 object-contain"
                        />

                        <span
                          v-else-if="form.mode === 'text'"
                          class="block max-w-[130px] whitespace-nowrap text-center text-[15px] font-extrabold"
                        >
                          {{
                            form.text.length > 16
                              ? form.text.slice(0, 16) + "..."
                              : form.text
                          }}
                        </span>

                        <Image v-else :size="27" class="text-slate-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p class="mt-4 text-center text-xs leading-6 text-slate-500">
                Watermark placement is adjusted for each PDF page's dimensions
                and rotation.
              </p>

              <div
                class="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-4"
              >
                <ShieldCheck :size="21" class="mt-0.5 shrink-0 text-blue-600" />

                <div>
                  <p class="text-sm font-bold text-slate-900">
                    Private processing
                  </p>

                  <p class="mt-1 text-xs leading-6 text-slate-600">
                    Your PDF and watermark image are processed in your browser
                    without being uploaded to a conversion server.
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

        <!-- GENERATE -->
        <button
          type="button"
          class="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canProcess"
          @click="generateWatermark"
        >
          <Stamp :size="21" />

          {{ processing ? "Adding watermark..." : "Add Watermark to PDF" }}
        </button>

        <!-- SUCCESS -->
        <div
          v-if="downloadUrl"
          class="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center"
          aria-live="polite"
        >
          <CheckCircle2 :size="35" class="mx-auto text-blue-600" />

          <h3 class="mt-3 text-lg font-extrabold text-slate-900">
            Your watermarked PDF is ready!
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
            Download PDF
          </a>
        </div>

        <p class="mt-5 text-center text-xs leading-6 text-slate-500">
          This tool adds visible watermarks. It does not remove confidential
          information or prevent all forms of editing.
        </p>
      </section>
    </div>
  </div>
</template>
