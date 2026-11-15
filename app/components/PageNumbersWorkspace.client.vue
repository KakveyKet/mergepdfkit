<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from "vue";

import { PDFDocument } from "pdf-lib";

import {
  addPageNumbersToPdf,
  parsePageRange,
} from "~/utils/pdf/addPageNumbers.mjs";

const MAX_SIZE = 40 * 1024 * 1024;

const fileInput = ref(null);
const selectedFile = ref(null);
const totalPages = ref(0);

const loadingFile = ref(false);
const processing = ref(false);

const error = ref("");
const success = ref("");

const downloadUrl = ref("");
const downloadName = ref("");

// Settings
const pageRange = ref("all");
const position = ref("bottom-center");
const format = ref("page");
const startNumber = ref(1);
const fontSize = ref(12);
const margin = ref(24);
const textColor = ref("black");

const positions = [
  { label: "Top left", value: "top-left" },
  { label: "Top center", value: "top-center" },
  { label: "Top right", value: "top-right" },
  { label: "Bottom left", value: "bottom-left" },
  { label: "Bottom center", value: "bottom-center" },
  { label: "Bottom right", value: "bottom-right" },
];

const colors = [
  { label: "Black", value: "black" },
  { label: "Gray", value: "gray" },
  { label: "Blue", value: "blue" },
];

const rangeResult = computed(() => {
  if (!totalPages.value) {
    return { indexes: [], error: "" };
  }

  try {
    return {
      indexes: parsePageRange(pageRange.value, totalPages.value),
      error: "",
    };
  } catch (err) {
    return {
      indexes: [],
      error: err.message,
    };
  }
});

const selectedCount = computed(() => rangeResult.value.indexes.length);

const previewNumber = computed(() => {
  const number = Number(startNumber.value);
  return Number.isInteger(number) && number > 0 ? number : 1;
});

const previewText = computed(() => {
  const number = previewNumber.value;
  const last = number + Math.max(selectedCount.value, 1) - 1;

  if (format.value === "number") {
    return String(number);
  }

  if (format.value === "of") {
    return `Page ${number} of ${last}`;
  }

  return `Page ${number}`;
});

const previewPositionClass = computed(() => {
  const current = position.value;

  const vertical = current.startsWith("top") ? "top-3" : "bottom-3";

  let horizontal = "left-1/2 -translate-x-1/2";

  if (current.endsWith("left")) {
    horizontal = "left-3";
  }

  if (current.endsWith("right")) {
    horizontal = "right-3";
  }

  return `${vertical} ${horizontal}`;
});

const previewColorClass = computed(() => {
  if (textColor.value === "blue") return "text-blue-600";
  if (textColor.value === "gray") return "text-slate-500";
  return "text-slate-900";
});

const busy = computed(() => loadingFile.value || processing.value);

const canProcess = computed(() => {
  return (
    selectedFile.value &&
    totalPages.value > 0 &&
    !busy.value &&
    !rangeResult.value.error
  );
});

const fileSizeLabel = computed(() => {
  if (!selectedFile.value) return "";

  return (selectedFile.value.size / 1024 / 1024).toFixed(2) + " MB";
});

function clearDownload() {
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value);
  }

  downloadUrl.value = "";
  downloadName.value = "";
  success.value = "";
}

watch(
  [pageRange, position, format, startNumber, fontSize, margin, textColor],
  () => {
    clearDownload();
  },
);

function openFilePicker() {
  if (busy.value) return;
  fileInput.value?.click();
}

async function loadFile(file) {
  if (!file || busy.value) return;

  clearDownload();
  error.value = "";
  selectedFile.value = null;
  totalPages.value = 0;

  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  if (!isPdf) {
    error.value = "Please choose a PDF file.";
    return;
  }

  if (file.size === 0) {
    error.value = "This PDF file is empty.";
    return;
  }

  if (file.size > MAX_SIZE) {
    error.value = "The file is too large. Maximum size is 40 MB.";
    return;
  }

  loadingFile.value = true;

  try {
    const data = await file.arrayBuffer();

    const document = await PDFDocument.load(data, {
      updateMetadata: false,
    });

    const count = document.getPageCount();

    if (count < 1) {
      throw new Error("The PDF contains no pages.");
    }

    selectedFile.value = file;
    totalPages.value = count;
    pageRange.value = "all";
  } catch (err) {
    console.error("PDF read error:", err);

    error.value =
      "Unable to open this PDF. It may be damaged, encrypted, or unsupported.";
  } finally {
    loadingFile.value = false;
  }
}

function handleFileChange(event) {
  const file = event.target.files?.[0];

  if (file) {
    void loadFile(file);
  }

  // Allows selecting the same file again.
  event.target.value = "";
}

function handleDrop(event) {
  event.preventDefault();

  if (busy.value) return;

  const file = event.dataTransfer?.files?.[0];

  if (file) {
    void loadFile(file);
  }
}

function removeFile() {
  if (busy.value) return;

  clearDownload();
  selectedFile.value = null;
  totalPages.value = 0;
  error.value = "";
  pageRange.value = "all";

  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

async function generatePdf() {
  error.value = "";
  clearDownload();

  if (!selectedFile.value) {
    error.value = "Please upload a PDF first.";
    return;
  }

  if (rangeResult.value.error) {
    error.value = rangeResult.value.error;
    return;
  }

  processing.value = true;

  // Allow the loading state to appear before processing.
  await nextTick();

  try {
    const result = await addPageNumbersToPdf(selectedFile.value, {
      pageRange: pageRange.value,
      position: position.value,
      format: format.value,
      startNumber: startNumber.value,
      fontSize: fontSize.value,
      margin: margin.value,
      color: textColor.value,
    });

    const blob = new Blob([result.bytes], {
      type: "application/pdf",
    });

    downloadUrl.value = URL.createObjectURL(blob);

    const baseName = selectedFile.value.name.replace(/\.pdf$/i, "");

    downloadName.value = `${baseName}-numbered.pdf`;

    success.value =
      `Successfully numbered ${result.numberedPages} ` +
      `of ${result.totalPages} pages.`;
  } catch (err) {
    console.error("Page numbering error:", err);

    error.value =
      err?.message || "Something went wrong while processing the PDF.";
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
    <form
      class="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
      @submit.prevent="generatePdf"
    >
      <!-- UPLOAD -->
      <div class="border-b border-slate-100 p-5 sm:p-8">
        <h2 class="text-xl font-extrabold text-slate-900">Upload your PDF</h2>

        <p class="mt-2 text-sm text-slate-600">
          Select a PDF document to add page numbers.
        </p>

        <input
          ref="fileInput"
          type="file"
          accept=".pdf,application/pdf"
          class="sr-only"
          aria-label="Choose PDF file"
          @change="handleFileChange"
        />

        <div
          class="mt-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-5 py-10 text-center transition hover:border-blue-400"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm"
            aria-hidden="true"
          >
            📄
          </div>

          <p class="mt-4 font-bold text-slate-900">Drop your PDF here</p>

          <p class="mt-2 text-sm text-slate-500">
            Or select it from your device
          </p>

          <button
            type="button"
            class="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="busy"
            @click="openFilePicker"
          >
            {{ loadingFile ? "Reading PDF..." : "Choose PDF File" }}
          </button>

          <p class="mt-4 text-xs text-slate-500">
            PDF only · Maximum 40 MB · Processed in your browser
          </p>
        </div>

        <!-- FILE INFO -->
        <div
          v-if="selectedFile"
          class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="min-w-0">
            <p class="break-all font-bold text-slate-900">
              {{ selectedFile.name }}
            </p>

            <p class="mt-1 text-xs text-slate-500">
              {{ totalPages }} pages · {{ fileSizeLabel }}
            </p>
          </div>

          <button
            type="button"
            class="text-sm font-semibold text-red-600 hover:underline"
            :disabled="busy"
            @click="removeFile"
          >
            Remove
          </button>
        </div>
      </div>

      <!-- OPTIONS -->
      <div class="p-5 sm:p-8">
        <h2 class="text-xl font-extrabold text-slate-900">
          Page number settings
        </h2>

        <p class="mt-2 text-sm text-slate-600">
          Customize how page numbers appear.
        </p>

        <div class="mt-7 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <!-- SETTINGS -->
          <div class="space-y-5">
            <!-- PAGE RANGE -->
            <div>
              <label
                for="number-page-range"
                class="mb-2 block text-sm font-bold text-slate-700"
              >
                Pages to number
              </label>

              <input
                id="number-page-range"
                v-model="pageRange"
                type="text"
                placeholder="all or 2-5,8"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p class="mt-2 text-xs text-slate-500">
                Use "all", "2-5", "2-5,8", or "2-" to skip page 1.
              </p>

              <p v-if="rangeResult.error" class="mt-2 text-xs text-red-600">
                {{ rangeResult.error }}
              </p>

              <p v-else-if="totalPages" class="mt-2 text-xs text-blue-600">
                {{ selectedCount }} pages selected
              </p>
            </div>

            <!-- POSITION -->
            <div>
              <label
                for="number-position"
                class="mb-2 block text-sm font-bold text-slate-700"
              >
                Position
              </label>

              <select
                id="number-position"
                v-model="position"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option
                  v-for="item in positions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
            </div>

            <!-- FORMAT -->
            <div>
              <label
                for="number-format"
                class="mb-2 block text-sm font-bold text-slate-700"
              >
                Number format
              </label>

              <select
                id="number-format"
                v-model="format"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="number">1, 2, 3</option>

                <option value="page">Page 1, Page 2</option>

                <option value="of">Page 1 of 10</option>
              </select>
            </div>

            <!-- START NUMBER / FONT SIZE -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  for="number-start"
                  class="mb-2 block text-sm font-bold text-slate-700"
                >
                  Start numbering at
                </label>

                <input
                  id="number-start"
                  v-model.number="startNumber"
                  type="number"
                  min="1"
                  max="100000"
                  step="1"
                  class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  for="number-size"
                  class="mb-2 block text-sm font-bold text-slate-700"
                >
                  Font size
                </label>

                <input
                  id="number-size"
                  v-model.number="fontSize"
                  type="number"
                  min="8"
                  max="36"
                  step="1"
                  class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <!-- MARGIN / COLOR -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  for="number-margin"
                  class="mb-2 block text-sm font-bold text-slate-700"
                >
                  Margin (pt)
                </label>

                <input
                  id="number-margin"
                  v-model.number="margin"
                  type="number"
                  min="12"
                  max="80"
                  step="1"
                  class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  for="number-color"
                  class="mb-2 block text-sm font-bold text-slate-700"
                >
                  Text color
                </label>

                <select
                  id="number-color"
                  v-model="textColor"
                  class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option
                    v-for="item in colors"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- POSITION ILLUSTRATION -->
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="font-bold text-slate-900">Position preview</h3>

            <p class="mt-1 text-xs text-slate-500">
              Illustration only — not an actual PDF preview.
            </p>

            <div
              class="mx-auto mt-6 flex min-h-[270px] items-center justify-center rounded-xl bg-slate-100 p-5"
            >
              <div
                class="relative h-[220px] w-[160px] rounded-sm border border-slate-200 bg-white shadow-md"
              >
                <div class="absolute left-5 right-5 top-9 space-y-3">
                  <div class="h-2 rounded bg-slate-200"></div>
                  <div class="h-2 w-4/5 rounded bg-slate-200"></div>
                  <div class="h-2 rounded bg-slate-200"></div>
                  <div class="h-2 w-3/5 rounded bg-slate-200"></div>
                </div>

                <span
                  class="absolute whitespace-nowrap text-[9px] font-semibold"
                  :class="[previewPositionClass, previewColorClass]"
                >
                  {{ previewText }}
                </span>
              </div>
            </div>

            <p class="mt-4 text-center text-xs text-slate-500">
              The downloaded PDF keeps its original content. Numbers are placed
              over the selected page margins.
            </p>
          </div>
        </div>

        <!-- ERROR MESSAGE -->
        <p
          v-if="error"
          role="alert"
          class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {{ error }}
        </p>

        <!-- PROCESS BUTTON -->
        <button
          type="submit"
          class="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canProcess"
        >
          {{ processing ? "Adding Page Numbers..." : "Add Page Numbers" }}
        </button>

        <!-- SUCCESS & DOWNLOAD -->
        <div
          v-if="downloadUrl"
          class="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center"
          aria-live="polite"
        >
          <p class="font-bold text-slate-900">✓ Your PDF is ready!</p>

          <p class="mt-2 text-sm text-slate-600">
            {{ success }}
          </p>

          <a
            :href="downloadUrl"
            :download="downloadName"
            class="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-700"
          >
            Download Numbered PDF ↓
          </a>
        </div>

        <p class="mt-5 text-center text-xs text-slate-500">
          Your document is processed locally in your browser. PDFEasy does not
          upload it to a server for numbering.
        </p>
      </div>
    </form>
  </div>
</template>
