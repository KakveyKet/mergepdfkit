import { PDFDocument, degrees } from "pdf-lib";

const MAX_PDF_SIZE = 40 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function isPdf(file) {
  return file?.type === "application/pdf" || /\.pdf$/i.test(file?.name || "");
}

export function validateSignaturePdf(file) {
  if (!file || !isPdf(file)) {
    throw new Error("Please choose a PDF file.");
  }

  if (!file.size || file.size > MAX_PDF_SIZE) {
    throw new Error("The PDF must be between 1 byte and 40 MB.");
  }
}

export function validateSignatureImage(file) {
  if (!file) {
    throw new Error("Please choose a signature image.");
  }

  const isPng = file.type === "image/png" || /\.png$/i.test(file.name);

  const isJpg = file.type === "image/jpeg" || /\.(jpg|jpeg)$/i.test(file.name);

  if (!isPng && !isJpg) {
    throw new Error("Only PNG and JPG images are supported.");
  }

  if (!file.size || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Signature images must be smaller than 5 MB.");
  }

  return isPng ? "png" : "jpg";
}

function assertFraction(value, label) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(`${label} must be between 0 and 1.`);
  }
}

/**
 * Given a PDF page and a rectangle expressed in
 * visual page coordinates, calculate coordinates
 * for drawing an upright signature image.
 *
 * left/top/width are fractions (0..1).
 */
function getSignaturePlacement(page, image, placement) {
  const crop = page.getCropBox();

  const rotation = ((page.getRotation().angle % 360) + 360) % 360;

  if (![0, 90, 180, 270].includes(rotation)) {
    throw new Error("Unsupported page rotation.");
  }

  const sideways = rotation === 90 || rotation === 270;

  const visibleWidth = sideways ? crop.height : crop.width;

  const visibleHeight = sideways ? crop.width : crop.height;

  const width = visibleWidth * placement.width;
  const height = width * (image.height / image.width);

  const left = visibleWidth * placement.x;
  const top = visibleHeight * placement.y;
  const bottom = visibleHeight - top - height;

  const tolerance = 0.01;

  if (
    width <= 0 ||
    height <= 0 ||
    left < -tolerance ||
    top < -tolerance ||
    left + width > visibleWidth + tolerance ||
    top + height > visibleHeight + tolerance
  ) {
    throw new Error(
      "The signature must fit entirely inside the selected PDF page.",
    );
  }

  let x;
  let y;

  switch (rotation) {
    case 90:
      x = crop.x + crop.width - bottom;
      y = crop.y + left;
      break;

    case 180:
      x = crop.x + crop.width - left;
      y = crop.y + crop.height - bottom;
      break;

    case 270:
      x = crop.x + bottom;
      y = crop.y + crop.height - left;
      break;

    default:
      x = crop.x + left;
      y = crop.y + bottom;
  }

  return {
    x,
    y,
    width,
    height,
    rotation,
  };
}

/**
 * Add a visible signature image to one PDF page.
 *
 * signatureDataUrl: PNG data URI from drawing canvas
 * signatureFile: uploaded PNG/JPG image
 *
 * Supply exactly one signature source.
 */
export async function signPdfFile(file, options = {}) {
  validateSignaturePdf(file);

  const {
    pageNumber,
    signatureDataUrl = null,
    signatureFile = null,
    placement = {},
  } = options;

  if (Boolean(signatureDataUrl) === Boolean(signatureFile)) {
    throw new Error("Provide either a drawn signature or a signature image.");
  }

  const x = Number(placement.x);
  const y = Number(placement.y);
  const width = Number(placement.width);

  assertFraction(x, "Horizontal position");
  assertFraction(y, "Vertical position");
  assertFraction(width, "Signature width");

  if (width <= 0) {
    throw new Error("Signature width must be positive.");
  }

  const pdfBytes = await file.arrayBuffer();

  let pdf;

  try {
    pdf = await PDFDocument.load(pdfBytes, {
      updateMetadata: false,
    });
  } catch {
    throw new Error("Unable to edit this PDF. It may be encrypted or damaged.");
  }

  const totalPages = pdf.getPageCount();
  const targetPage = Number(pageNumber);

  if (
    !Number.isInteger(targetPage) ||
    targetPage < 1 ||
    targetPage > totalPages
  ) {
    throw new Error("Select a valid PDF page.");
  }

  let image;

  if (signatureDataUrl) {
    if (
      typeof signatureDataUrl !== "string" ||
      !signatureDataUrl.startsWith("data:image/png;base64,")
    ) {
      throw new Error("Invalid drawn signature.");
    }

    image = await pdf.embedPng(signatureDataUrl);
  } else {
    const imageType = validateSignatureImage(signatureFile);
    const bytes = await signatureFile.arrayBuffer();

    image =
      imageType === "png"
        ? await pdf.embedPng(bytes)
        : await pdf.embedJpg(bytes);
  }

  const page = pdf.getPage(targetPage - 1);

  const rect = getSignaturePlacement(page, image, {
    x,
    y,
    width,
  });

  page.drawImage(image, {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    rotate: degrees(rect.rotation),
  });

  const output = await pdf.save();

  const originalName = file.name.replace(/\.pdf$/i, "");

  return {
    bytes: output,
    fileName: `${originalName}-signed.pdf`,
    pageNumber: targetPage,
    totalPages,
  };
}
