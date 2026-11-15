import { PDFDocument } from "pdf-lib";

export const MAX_COMPRESS_FILE_SIZE = 40 * 1024 * 1024;
export const MAX_RASTER_PAGES = 30;

const MAX_CANVAS_PIXELS = 6_000_000;
const MAX_CANVAS_SIDE = 8192;

export function validateCompressPdfFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Please select a PDF file.");
  }

  const isPdf =
    file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");

  if (!isPdf) {
    throw new Error("Only PDF files are supported.");
  }

  if (!file.size) {
    throw new Error("The selected PDF file is empty.");
  }

  if (file.size > MAX_COMPRESS_FILE_SIZE) {
    throw new Error("Maximum PDF size is 40 MB.");
  }
}

async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist/build/pdf.mjs"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);

  // Use the worker bundled with the installed PDF.js version.
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  return pdfjs;
}

async function openPdfForRendering(file) {
  validateCompressPdfFile(file);

  const pdfjs = await loadPdfJs();

  const data = new Uint8Array(await file.arrayBuffer());

  const loadingTask = pdfjs.getDocument({ data });

  try {
    const pdf = await loadingTask.promise;

    if (pdf.numPages < 1) {
      throw new Error("The PDF has no pages.");
    }

    return { loadingTask, pdf };
  } catch (error) {
    await loadingTask.destroy().catch(() => {});

    if (error?.name === "PasswordException") {
      throw new Error("Password-protected PDFs are not supported.");
    }

    throw new Error(error?.message || "Unable to open this PDF document.");
  }
}

export async function getCompressPdfInfo(file) {
  const { loadingTask, pdf } = await openPdfForRendering(file);

  try {
    return {
      totalPages: pdf.numPages,
      originalSize: file.size,
    };
  } finally {
    await loadingTask.destroy();
  }
}

/**
 * Text-preserving optimization attempt.
 *
 * This does not recompress embedded JPEG images.
 * It may make little difference to an already
 * optimized PDF.
 */
async function optimizePdf(file, onProgress, onStatus) {
  onStatus("Reading PDF structure...");
  onProgress(15);

  const data = await file.arrayBuffer();

  let pdf;

  try {
    pdf = await PDFDocument.load(data, {
      updateMetadata: false,
    });
  } catch {
    throw new Error(
      "This PDF cannot be optimized. " +
        "It may be encrypted, damaged or unsupported.",
    );
  }

  const pageCount = pdf.getPageCount();

  onStatus("Optimizing PDF objects...");
  onProgress(55);

  // Rewriting a PDF may alter document structure,
  // annotations, forms and existing signatures.
  const bytes = await pdf.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
    addDefaultPage: false,
  });

  onProgress(95);

  return { bytes, pageCount };
}

function validateRasterSettings(options) {
  const dpi = Number(options.dpi ?? 96);
  const quality = Number(options.quality ?? 65);

  if (![72, 96, 120, 144].includes(dpi)) {
    throw new Error("Resolution must be 72, 96, 120 or 144 DPI.");
  }

  if (!Number.isInteger(quality) || quality < 40 || quality > 90) {
    throw new Error("Image quality must be between 40 and 90.");
  }

  return { dpi, quality };
}

/**
 * Render a page as JPG.
 *
 * The canvas is released after each page,
 * reducing peak browser memory requirements.
 */
async function renderPageAsJpeg(page, dpi, quality) {
  const original = page.getViewport({ scale: 1 });

  const targetScale = dpi / 72;

  const pixelLimitScale = Math.sqrt(
    MAX_CANVAS_PIXELS / (original.width * original.height),
  );

  const sideLimitScale = Math.min(
    MAX_CANVAS_SIDE / original.width,
    MAX_CANVAS_SIDE / original.height,
  );

  const scale = Math.min(targetScale, pixelLimitScale, sideLimitScale);

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

    throw new Error("Your browser could not create an image canvas.");
  }

  try {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
      background: "rgb(255,255,255)",
    }).promise;

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Unable to create a compressed page image."));
            return;
          }

          resolve(result);
        },
        "image/jpeg",
        quality / 100,
      );
    });

    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      width: original.width,
      height: original.height,
    };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

/**
 * Stronger compression:
 *
 * 1. Render PDF pages.
 * 2. Encode them as JPEGs.
 * 3. Create a new PDF containing those images.
 *
 * This discards selectable text, PDF forms,
 * hyperlinks, document outlines and signatures.
 */
async function rasterCompressPdf(file, options, onProgress, onStatus) {
  const { dpi, quality } = validateRasterSettings(options);

  const { loadingTask, pdf } = await openPdfForRendering(file);

  try {
    const total = pdf.numPages;

    if (total > MAX_RASTER_PAGES) {
      throw new Error(
        `Image compression supports up to ` +
          `${MAX_RASTER_PAGES} pages per PDF.`,
      );
    }

    const output = await PDFDocument.create();

    // Use the original visual page orientation.
    // Rotated source pages are rendered upright.
    for (let index = 1; index <= total; index++) {
      onStatus(`Compressing page ${index} of ${total}...`);

      const page = await pdf.getPage(index);

      try {
        const result = await renderPageAsJpeg(page, dpi, quality);

        const image = await output.embedJpg(result.bytes);

        const newPage = output.addPage([result.width, result.height]);

        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width: result.width,
          height: result.height,
        });
      } finally {
        page.cleanup();
      }

      onProgress(Math.round((index / total) * 90));
    }

    onStatus("Preparing the compressed PDF...");

    const bytes = await output.save({
      useObjectStreams: true,
    });

    onProgress(95);

    return { bytes, pageCount: total };
  } finally {
    await loadingTask.destroy();
  }
}

/**
 * Main compression function.
 *
 * Returns a downloadable result only if its
 * byte size is smaller than the original PDF.
 */
export async function compressPdfFile(file, options = {}) {
  validateCompressPdfFile(file);

  const {
    mode = "optimize",
    dpi = 96,
    quality = 65,
    onProgress = () => {},
    onStatus = () => {},
  } = options;

  if (!["optimize", "rasterize"].includes(mode)) {
    throw new Error("Invalid compression mode.");
  }

  const result =
    mode === "optimize"
      ? await optimizePdf(file, onProgress, onStatus)
      : await rasterCompressPdf(file, { dpi, quality }, onProgress, onStatus);

  const originalSize = file.size;
  const compressedSize = result.bytes.byteLength;

  const savedBytes = Math.max(0, originalSize - compressedSize);

  const savedPercent = (savedBytes / originalSize) * 100;

  onProgress(100);

  const improved = compressedSize < originalSize;

  const name = file.name.replace(/\.pdf$/i, "");

  return {
    improved,
    // Keep an output only if it actually saves space.
    bytes: improved ? result.bytes : null,
    fileName: `${name}-compressed.pdf`,
    originalSize,
    compressedSize,
    savedBytes,
    savedPercent,
    pageCount: result.pageCount,
    mode,
  };
}
