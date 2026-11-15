const MAX_FILE_SIZE = 40 * 1024 * 1024;
const MAX_EXPORT_PAGES = 20;
const MAX_CANVAS_PIXELS = 9_000_000;
const MAX_CANVAS_SIDE = 8192;

export const PDF_TO_PNG_MAX_PAGES = MAX_EXPORT_PAGES;

/**
 * Supports:
 * all
 * 1
 * 1-5
 * 1,3,5
 * 2-
 */
export function parsePngPageRange(value, totalPages) {
  if (!Number.isInteger(totalPages) || totalPages < 1) {
    throw new Error("The PDF contains no pages.");
  }

  const input = String(value ?? "all")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (!input || input === "all") {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const selected = new Set();

  for (const part of input.split(",")) {
    const match = /^(\d+)(?:-(\d*))?$/.exec(part);

    if (!match) {
      throw new Error("Invalid page range. Try all, 1-3,5 or 2-.");
    }

    const start = Number(match[1]);

    const end =
      match[2] === undefined
        ? start
        : match[2] === ""
          ? totalPages
          : Number(match[2]);

    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 1 ||
      end > totalPages ||
      start > end
    ) {
      throw new Error(`Choose pages between 1 and ${totalPages}.`);
    }

    for (let number = start; number <= end; number++) {
      selected.add(number);
    }
  }

  return [...selected].sort((a, b) => a - b);
}

function validatePdf(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Please select a PDF file.");
  }

  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  if (!isPdf) {
    throw new Error("Only PDF files are supported.");
  }

  if (!file.size) {
    throw new Error("The selected PDF is empty.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Maximum PDF file size is 40 MB.");
  }
}

/**
 * Load PDF.js only in the browser.
 * The worker is bundled locally by Vite.
 */
async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist/build/pdf.mjs"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);

  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  return pdfjs;
}

async function openPdf(file) {
  validatePdf(file);

  const pdfjs = await loadPdfJs();

  const data = new Uint8Array(await file.arrayBuffer());

  const task = pdfjs.getDocument({ data });

  try {
    const pdf = await task.promise;
    return { task, pdf };
  } catch (error) {
    await task.destroy().catch(() => {});

    if (error?.name === "PasswordException") {
      throw new Error("Password-protected PDFs are not supported.");
    }

    throw new Error(
      "Unable to open this PDF. It may be damaged or unsupported.",
    );
  }
}

export async function getPdfPngInfo(file) {
  const { task, pdf } = await openPdf(file);

  try {
    if (!pdf.numPages) {
      throw new Error("The PDF has no pages.");
    }

    return {
      pageCount: pdf.numPages,
      fileSize: file.size,
    };
  } finally {
    await task.destroy();
  }
}

async function renderPageToPng(page, dpi) {
  const base = page.getViewport({ scale: 1 });

  const requestedScale = dpi / 72;

  const pixelScale = Math.sqrt(MAX_CANVAS_PIXELS / (base.width * base.height));

  const sideScale = Math.min(
    MAX_CANVAS_SIDE / base.width,
    MAX_CANVAS_SIDE / base.height,
  );

  const scale = Math.min(requestedScale, pixelScale, sideScale);

  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error("Invalid PDF page dimensions.");
  }

  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.floor(viewport.width));

  canvas.height = Math.max(1, Math.floor(viewport.height));

  const context = canvas.getContext("2d", {
    alpha: false,
  });

  if (!context) {
    canvas.width = 0;
    canvas.height = 0;

    throw new Error("Unable to create an image canvas.");
  }

  try {
    // Standard white document background.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport,
      background: "#ffffff",
    }).promise;

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to export PNG image."));
        }
      }, "image/png");
    });
  } finally {
    // Release browser canvas memory.
    canvas.width = 0;
    canvas.height = 0;
  }
}

/**
 * One selected page -> PNG Blob.
 * Multiple pages -> ZIP Blob.
 */
export async function convertPdfToPng(file, options = {}) {
  const {
    pageRange = "all",
    dpi = 144,
    onProgress = () => {},
    onStatus = () => {},
  } = options;

  const resolution = Number(dpi);

  if (![96, 144, 200].includes(resolution)) {
    throw new Error("Choose 96, 144 or 200 DPI.");
  }

  const { task, pdf } = await openPdf(file);

  try {
    const selected = parsePngPageRange(pageRange, pdf.numPages);

    if (selected.length > MAX_EXPORT_PAGES) {
      throw new Error(`Select up to ${MAX_EXPORT_PAGES} pages per conversion.`);
    }

    const basename =
      file.name
        .replace(/\.pdf$/i, "")
        .replace(/[^\w-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70) || "document";

    const digits = Math.max(2, String(pdf.numPages).length);

    const imageName = (pageNumber) =>
      `${basename}-page-${String(pageNumber).padStart(digits, "0")}.png`;

    if (selected.length === 1) {
      const number = selected[0];

      onStatus(`Converting page ${number}...`);

      const page = await pdf.getPage(number);

      let blob;

      try {
        blob = await renderPageToPng(page, resolution);
      } finally {
        page.cleanup();
      }

      onProgress(1, 1);

      return {
        blob,
        fileName: imageName(number),
        fileType: "image/png",
        convertedPages: 1,
        totalPages: pdf.numPages,
      };
    }

    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    for (let index = 0; index < selected.length; index++) {
      const pageNumber = selected[index];

      onStatus(
        `Converting page ${pageNumber} (${index + 1}/${selected.length})...`,
      );

      const page = await pdf.getPage(pageNumber);

      try {
        const blob = await renderPageToPng(page, resolution);

        zip.file(imageName(pageNumber), blob);
      } finally {
        page.cleanup();
      }

      onProgress(index + 1, selected.length);
    }

    onStatus("Preparing ZIP download...");

    // PNG already has lossless compression.
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "STORE",
    });

    return {
      blob,
      fileName: `${basename}-png-images.zip`,
      fileType: "application/zip",
      convertedPages: selected.length,
      totalPages: pdf.numPages,
    };
  } finally {
    await task.destroy();
  }
}
