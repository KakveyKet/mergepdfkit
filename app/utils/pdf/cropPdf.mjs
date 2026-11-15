import { PDFDocument } from "pdf-lib";

export const MAX_CROP_PDF_SIZE = 40 * 1024 * 1024;

export const DEFAULT_CROP_RECT = {
  x: 0.05,
  y: 0.05,
  width: 0.9,
  height: 0.9,
};

export function validateCropPdf(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Please select a PDF file.");
  }

  const valid =
    file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");

  if (!valid) {
    throw new Error("Only PDF files are supported.");
  }

  if (file.size === 0) {
    throw new Error("The selected PDF is empty.");
  }

  if (file.size > MAX_CROP_PDF_SIZE) {
    throw new Error("Maximum file size is 40 MB.");
  }
}

/**
 * Examples:
 * all
 * 1
 * 1-4
 * 1,3,7
 * 2-
 *
 * Returns zero-based indexes.
 */
export function parseCropPages(value, totalPages) {
  if (!Number.isInteger(totalPages) || totalPages < 1) {
    throw new Error("The PDF contains no pages.");
  }

  const input = String(value ?? "all")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (!input || input === "all") {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const selected = new Set();

  for (const part of input.split(",")) {
    const match = /^(\d+)(?:-(\d*))?$/.exec(part);

    if (!match) {
      throw new Error("Invalid page range. Use all, 1-3,5 or 2-.");
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
      throw new Error(`Select pages between 1 and ${totalPages}.`);
    }

    for (let n = start; n <= end; n++) {
      selected.add(n - 1);
    }
  }

  return [...selected].sort((a, b) => a - b);
}

/**
 * rect uses fractions of the displayed PDF preview:
 * x      left position: 0..1
 * y      top position: 0..1
 * width  relative width
 * height relative height
 */
export function validateCropRect(rect) {
  if (!rect) {
    throw new Error("Please select a crop area.");
  }

  const values = [rect.x, rect.y, rect.width, rect.height].map(Number);

  if (values.some((n) => !Number.isFinite(n))) {
    throw new Error("Invalid crop dimensions.");
  }

  const [x, y, width, height] = values;

  const epsilon = 0.00001;

  if (
    x < 0 ||
    y < 0 ||
    width < 0.05 ||
    height < 0.05 ||
    x + width > 1 + epsilon ||
    y + height > 1 + epsilon
  ) {
    throw new Error(
      "Keep the crop area inside the page and at least 5% wide and tall.",
    );
  }

  return { x, y, width, height };
}

/**
 * Calculate intersection of MediaBox and CropBox.
 * PDF.js renders the effective visible area.
 */
function getVisibleBox(page) {
  const media = page.getMediaBox();
  const crop = page.getCropBox();

  const left = Math.max(media.x, crop.x);
  const bottom = Math.max(media.y, crop.y);

  const right = Math.min(media.x + media.width, crop.x + crop.width);

  const top = Math.min(media.y + media.height, crop.y + crop.height);

  const width = right - left;
  const height = top - bottom;

  if (width <= 0 || height <= 0) {
    throw new Error("The PDF has invalid page boundaries.");
  }

  return {
    x: left,
    y: bottom,
    width,
    height,
  };
}

/**
 * Translate a normalized rectangle from the
 * DISPLAYED page (top-left origin) into the
 * original PDF page coordinate system.
 *
 * PDF coordinates have their origin at bottom-left.
 *
 * Rotation mapping:
 * 0   => normal
 * 90  => clockwise
 * 180 => upside down
 * 270 => counter-clockwise
 */
export function getCropBoxForPage(page, inputRect) {
  const rect = validateCropRect(inputRect);

  const box = getVisibleBox(page);

  const rotation = ((page.getRotation().angle % 360) + 360) % 360;

  if (![0, 90, 180, 270].includes(rotation)) {
    throw new Error("Unsupported page rotation.");
  }

  const { x, y, width, height } = rect;

  let cropX;
  let cropY;
  let cropWidth;
  let cropHeight;

  switch (rotation) {
    case 90:
      cropX = box.x + y * box.width;
      cropY = box.y + x * box.height;
      cropWidth = height * box.width;
      cropHeight = width * box.height;
      break;

    case 180:
      cropX = box.x + (1 - x - width) * box.width;
      cropY = box.y + y * box.height;
      cropWidth = width * box.width;
      cropHeight = height * box.height;
      break;

    case 270:
      cropX = box.x + (1 - y - height) * box.width;
      cropY = box.y + (1 - x - width) * box.height;
      cropWidth = height * box.width;
      cropHeight = width * box.height;
      break;

    default:
      cropX = box.x + x * box.width;
      cropY = box.y + (1 - y - height) * box.height;
      cropWidth = width * box.width;
      cropHeight = height * box.height;
  }

  return {
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight,
  };
}

/**
 * Apply the same proportional crop area
 * to every selected PDF page.
 *
 * The operation updates CropBox, not PDF content.
 * Content outside CropBox is still in the file.
 */
export async function cropPdfFile(file, options = {}) {
  validateCropPdf(file);

  const {
    rect = DEFAULT_CROP_RECT,
    pageRange = "all",
    onProgress = () => {},
  } = options;

  const validatedRect = validateCropRect(rect);

  const fullPage =
    validatedRect.x === 0 &&
    validatedRect.y === 0 &&
    validatedRect.width === 1 &&
    validatedRect.height === 1;

  if (fullPage) {
    throw new Error("Choose a smaller area to crop.");
  }

  let document;

  try {
    const bytes = await file.arrayBuffer();

    document = await PDFDocument.load(bytes, {
      updateMetadata: false,
    });
  } catch {
    throw new Error(
      "Unable to edit this PDF. It may be encrypted, damaged, or unsupported.",
    );
  }

  const pages = document.getPages();

  const selected = parseCropPages(pageRange, pages.length);

  for (let index = 0; index < selected.length; index++) {
    const page = pages[selected[index]];

    const box = getCropBoxForPage(page, validatedRect);

    page.setCropBox(box.x, box.y, box.width, box.height);

    onProgress(index + 1, selected.length);
  }

  const outputBytes = await document.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
  });

  const baseName = file.name.replace(/\.pdf$/i, "");

  return {
    bytes: outputBytes,
    fileName: `${baseName}-cropped.pdf`,
    totalPages: pages.length,
    croppedPages: selected.length,
  };
}
