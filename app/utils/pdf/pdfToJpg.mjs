const MAX_PDF_SIZE = 40 * 1024 * 1024;
const MAX_PAGES_PER_EXPORT = 40;
const MAX_CANVAS_PIXELS = 12_000_000;
const MAX_CANVAS_SIDE = 8192;

/**
 * Parse PDF page ranges.
 *
 * Examples:
 * all    -> all pages
 * 1      -> first page
 * 2-5    -> pages 2,3,4,5
 * 1,3,5  -> pages 1,3,5
 * 2-     -> page 2 through the last page
 */
export function parsePdfJpgPages(value, totalPages) {
  if (!Number.isInteger(totalPages) || totalPages < 1) {
    throw new Error("The PDF contains no pages.");
  }

  const input = String(value ?? "all")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (!input || input === "all") {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set();

  for (const part of input.split(",")) {
    const match = /^(\d+)(?:-(\d*))?$/.exec(part);

    if (!match) {
      throw new Error("Invalid page range. Use all, 1-3,5 or 2-.");
    }

    const from = Number(match[1]);
    const to =
      match[2] === undefined
        ? from
        : match[2] === ""
          ? totalPages
          : Number(match[2]);

    if (
      !Number.isSafeInteger(from) ||
      !Number.isSafeInteger(to) ||
      from < 1 ||
      to > totalPages ||
      from > to
    ) {
      throw new Error(`Choose pages between 1 and ${totalPages}.`);
    }

    for (let page = from; page <= to; page++) {
      pages.add(page);
    }
  }

  return [...pages].sort((a, b) => a - b);
}

function validateFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Please select a PDF file.");
  }

  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  if (!isPdf) {
    throw new Error("Only PDF files are supported.");
  }

  if (file.size === 0) {
    throw new Error("The selected PDF is empty.");
  }

  if (file.size > MAX_PDF_SIZE) {
    throw new Error("Maximum PDF file size is 40 MB.");
  }
}

// Lazy-load PDF.js in the browser.
// Vite bundles the matching worker as a local asset.
async function loadPdfJs() {
  const [pdfjs, workerAsset] = await Promise.all([
    import("pdfjs-dist/build/pdf.mjs"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);

  pdfjs.GlobalWorkerOptions.workerSrc = workerAsset.default;

  return pdfjs;
}

async function openPdf(file) {
  validateFile(file);

  const pdfjs = await loadPdfJs();

  const bytes = new Uint8Array(await file.arrayBuffer());

  const task = pdfjs.getDocument({
    data: bytes,
  });

  try {
    const pdf = await task.promise;

    return { task, pdf };
  } catch (error) {
    await task.destroy().catch(() => {});

    if (error?.name === "PasswordException") {
      throw new Error("Password-protected PDFs are not supported.");
    }

    throw new Error(
      "Unable to read this PDF. It may be damaged or unsupported.",
    );
  }
}

/**
 * Read the page count before conversion.
 */
export async function getPdfJpgInfo(file) {
  const { task, pdf } = await openPdf(file);

  try {
    const pageCount = pdf.numPages;

    if (!pageCount) {
      throw new Error("The PDF has no pages.");
    }

    return {
      pageCount,
      fileSize: file.size,
    };
  } finally {
    await task.destroy();
  }
}

/**
 * Render one PDF page as JPEG.
 */
async function renderPageToJpg(page, dpi, quality) {
  const baseViewport = page.getViewport({
    scale: 1,
  });

  const desiredScale = dpi / 72;

  // Limit memory usage for very large PDF pages.
  const maximumPixelScale = Math.sqrt(
    MAX_CANVAS_PIXELS / (baseViewport.width * baseViewport.height),
  );

  const maximumSideScale = Math.min(
    MAX_CANVAS_SIDE / baseViewport.width,
    MAX_CANVAS_SIDE / baseViewport.height,
  );

  const scale = Math.min(desiredScale, maximumPixelScale, maximumSideScale);

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
    throw new Error("Your browser cannot create an image canvas.");
  }

  try {
    // JPG has no transparency.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderTask = page.render({
      canvasContext: context,
      viewport,
      background: "rgb(255,255,255)",
    });

    await renderTask.promise;

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Unable to create the JPG image."));
          }
        },
        "image/jpeg",
        quality / 100,
      );
    });
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

/**
 * Convert a PDF into JPG files.
 *
 * One selected page => JPG Blob
 * Multiple pages    => ZIP Blob
 */
export async function convertPdfToJpg(file, options = {}) {
  const {
    pageRange = "all",
    dpi = 144,
    quality = 90,
    onProgress = () => {},
    onStatus = () => {},
  } = options;

  const selectedDpi = Number(dpi);
  const selectedQuality = Number(quality);

  if (![96, 144, 200].includes(selectedDpi)) {
    throw new Error("Choose 96, 144 or 200 DPI.");
  }

  if (
    !Number.isFinite(selectedQuality) ||
    selectedQuality < 60 ||
    selectedQuality > 100
  ) {
    throw new Error("JPG quality must be between 60 and 100.");
  }

  const { task, pdf } = await openPdf(file);

  try {
    const pageNumbers = parsePdfJpgPages(pageRange, pdf.numPages);

    if (pageNumbers.length > MAX_PAGES_PER_EXPORT) {
      throw new Error(
        `Please select up to ${MAX_PAGES_PER_EXPORT} pages per conversion.`,
      );
    }

    const total = pageNumbers.length;

    const baseName =
      file.name
        .replace(/\.pdf$/i, "")
        .replace(/[^\w-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70) || "document";

    const digits = Math.max(2, String(pdf.numPages).length);

    const getImageName = (pageNumber) =>
      `${baseName}-page-${String(pageNumber).padStart(digits, "0")}.jpg`;

    // Save a single page as JPG directly.
    if (total === 1) {
      const number = pageNumbers[0];
      const page = await pdf.getPage(number);

      let blob;

      try {
        onStatus(`Converting page ${number}...`);

        blob = await renderPageToJpg(page, selectedDpi, selectedQuality);
      } finally {
        page.cleanup();
      }

      onProgress(1, 1);

      return {
        blob,
        fileName: getImageName(number),
        fileType: "image/jpeg",
        convertedPages: 1,
        totalPages: pdf.numPages,
      };
    }

    // Multiple pages: build a ZIP.
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    for (let index = 0; index < total; index++) {
      const number = pageNumbers[index];

      onStatus(`Converting page ${number} (${index + 1}/${total})...`);

      const page = await pdf.getPage(number);

      try {
        const jpg = await renderPageToJpg(page, selectedDpi, selectedQuality);

        zip.file(getImageName(number), jpg);
      } finally {
        page.cleanup();
      }

      onProgress(index + 1, total);
    }

    onStatus("Creating ZIP download...");

    // JPG images are already compressed.
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "STORE",
      streamFiles: true,
    });

    return {
      blob,
      fileName: `${baseName}-jpg-images.zip`,
      fileType: "application/zip",
      convertedPages: total,
      totalPages: pdf.numPages,
    };
  } finally {
    // Release the PDF worker and document resources.
    await task.destroy();
  }
}
