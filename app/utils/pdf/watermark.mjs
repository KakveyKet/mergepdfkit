import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

const VALID_POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export function parseWatermarkPageRange(value, totalPages) {
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

  for (const item of input.split(",")) {
    const match = /^(\d+)(?:-(\d*))?$/.exec(item);

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
      throw new Error(`Select pages between 1 and ${totalPages}.`);
    }

    for (let page = start; page <= end; page++) {
      selected.add(page - 1);
    }
  }

  return [...selected].sort((a, b) => a - b);
}

function hexToRgb(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new Error("Invalid watermark color.");
  }

  const value = hex.slice(1);

  return rgb(
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  );
}

function validateNumber(value, min, max, label) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`${label} must be between ${min} and ${max}.`);
  }

  return number;
}

// Convert coordinates from the visually displayed
// page into PDF coordinates.
//
// This preserves correct watermark orientation
// when a PDF page is rotated by 90, 180, or 270 degrees.
function getVisiblePage(page) {
  const crop = page.getCropBox();

  const rotation = ((page.getRotation().angle % 360) + 360) % 360;

  if (![0, 90, 180, 270].includes(rotation)) {
    throw new Error("Unsupported PDF page rotation.");
  }

  const sideways = rotation === 90 || rotation === 270;

  const width = sideways ? crop.height : crop.width;
  const height = sideways ? crop.width : crop.height;

  function toPdf(x, y) {
    switch (rotation) {
      case 90:
        return {
          x: crop.x + crop.width - y,
          y: crop.y + x,
        };

      case 180:
        return {
          x: crop.x + crop.width - x,
          y: crop.y + crop.height - y,
        };

      case 270:
        return {
          x: crop.x + y,
          y: crop.y + crop.height - x,
        };

      default:
        return {
          x: crop.x + x,
          y: crop.y + y,
        };
    }
  }

  return {
    width,
    height,
    rotation,
    toPdf,
  };
}

// Calculate the bounding rectangle of an element
// after rotation around its lower-left origin.
function rotatedBounds(width, height, angle) {
  const radians = (angle * Math.PI) / 180;

  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);

  const corners = [
    [0, 0],
    [width * cosine, width * sine],
    [-height * sine, height * cosine],
    [width * cosine - height * sine, width * sine + height * cosine],
  ];

  const xs = corners.map((point) => point[0]);
  const ys = corners.map((point) => point[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getPlacement(page, elementWidth, elementHeight, angle, position) {
  const visible = getVisiblePage(page);

  const margin = Math.min(24, visible.width * 0.04, visible.height * 0.04);

  const availableWidth = visible.width - margin * 2;
  const availableHeight = visible.height - margin * 2;

  const originalBounds = rotatedBounds(elementWidth, elementHeight, angle);

  // Scale overly large watermarks to fit the page.
  const scale = Math.min(
    1,
    availableWidth / originalBounds.width,
    availableHeight / originalBounds.height,
  );

  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error("Watermark cannot fit on this page.");
  }

  const width = elementWidth * scale;
  const height = elementHeight * scale;

  const bounds = rotatedBounds(width, height, angle);

  const vertical = position === "center" ? "middle" : position.split("-")[0];

  const horizontal = position === "center" ? "center" : position.split("-")[1];

  let left;

  if (horizontal === "left") {
    left = margin;
  } else if (horizontal === "right") {
    left = visible.width - margin - bounds.width;
  } else {
    left = (visible.width - bounds.width) / 2;
  }

  let bottom;

  if (vertical === "top") {
    bottom = visible.height - margin - bounds.height;
  } else if (vertical === "bottom") {
    bottom = margin;
  } else {
    bottom = (visible.height - bounds.height) / 2;
  }

  // Compensate for the rotated element's bounds.
  const visualX = left - bounds.minX;
  const visualY = bottom - bounds.minY;

  const point = visible.toPdf(visualX, visualY);

  return {
    x: point.x,
    y: point.y,
    width,
    height,
    scale,
    rotation: visible.rotation + angle,
  };
}

export async function addWatermarkToPdf(pdfFile, options = {}) {
  const {
    mode = "text",
    text = "CONFIDENTIAL",
    imageFile = null,
    pageRange = "all",
    position = "center",
    rotation = -30,
    opacity = 25,
    fontSize = 48,
    imageScale = 45,
    color = "#64748b",
  } = options;

  if (!pdfFile?.arrayBuffer) {
    throw new Error("Please upload a PDF file.");
  }

  if (!VALID_POSITIONS.includes(position)) {
    throw new Error("Invalid watermark position.");
  }

  if (!["text", "image"].includes(mode)) {
    throw new Error("Invalid watermark type.");
  }

  const angle = validateNumber(rotation, -90, 90, "Rotation");

  const opacityValue = validateNumber(opacity, 5, 100, "Opacity") / 100;

  const textSize = validateNumber(fontSize, 12, 120, "Font size");

  const imageWidthPercent = validateNumber(imageScale, 10, 80, "Image width");

  const pdfBytes = await pdfFile.arrayBuffer();

  const document = await PDFDocument.load(pdfBytes, {
    updateMetadata: false,
  });

  const pages = document.getPages();

  const selectedIndexes = parseWatermarkPageRange(pageRange, pages.length);

  let font = null;
  let watermarkText = "";
  let watermarkColor = null;
  let image = null;

  if (mode === "text") {
    watermarkText = String(text ?? "").trim();

    if (!watermarkText || watermarkText.length > 120) {
      throw new Error("Enter watermark text with 1 to 120 characters.");
    }

    if (/[\r\n]/.test(watermarkText)) {
      throw new Error("Use a single line for the text watermark.");
    }

    font = await document.embedFont(StandardFonts.HelveticaBold);

    // Helvetica uses WinAnsi, not full Unicode.
    // Give an understandable error for unsupported text.
    try {
      font.encodeText(watermarkText);
    } catch {
      throw new Error(
        "This text contains unsupported characters. " +
          "For Khmer or other scripts, upload a PNG watermark instead.",
      );
    }

    watermarkColor = hexToRgb(color);
  } else {
    if (!imageFile?.arrayBuffer) {
      throw new Error("Please choose a PNG or JPG watermark image.");
    }

    const imageBytes = await imageFile.arrayBuffer();

    const isPng =
      imageFile.type === "image/png" || /\.png$/i.test(imageFile.name);

    const isJpg =
      imageFile.type === "image/jpeg" || /\.(jpe?g)$/i.test(imageFile.name);

    if (isPng) {
      image = await document.embedPng(imageBytes);
    } else if (isJpg) {
      image = await document.embedJpg(imageBytes);
    } else {
      throw new Error("Only PNG and JPG images are supported.");
    }
  }

  for (const index of selectedIndexes) {
    const page = pages[index];
    const visible = getVisiblePage(page);

    if (mode === "text") {
      const width = font.widthOfTextAtSize(watermarkText, textSize);

      const height = font.heightAtSize(textSize);

      const placement = getPlacement(page, width, height, angle, position);

      page.drawText(watermarkText, {
        x: placement.x,
        y: placement.y,
        size: textSize * placement.scale,
        font,
        color: watermarkColor,
        opacity: opacityValue,
        rotate: degrees(placement.rotation),
      });
    } else {
      // Preserve the source image aspect ratio.
      let width = visible.width * (imageWidthPercent / 100);

      let height = width * (image.height / image.width);

      // Keep tall images reasonably sized.
      const maximumHeight = visible.height * 0.75;

      if (height > maximumHeight) {
        const adjustment = maximumHeight / height;
        width *= adjustment;
        height *= adjustment;
      }

      const placement = getPlacement(page, width, height, angle, position);

      page.drawImage(image, {
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        rotate: degrees(placement.rotation),
        opacity: opacityValue,
      });
    }
  }

  const outputBytes = await document.save();

  return {
    bytes: outputBytes,
    totalPages: pages.length,
    watermarkedPages: selectedIndexes.length,
  };
}
