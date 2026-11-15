import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

const COLORS = {
  black: rgb(0.12, 0.16, 0.23),
  gray: rgb(0.43, 0.48, 0.55),
  blue: rgb(0.12, 0.35, 0.85),
};

const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

/**
 * Supported examples:
 * all       => every page
 * 2         => page 2
 * 2-5       => pages 2 through 5
 * 2-5,8     => pages 2 through 5, plus page 8
 * 2-        => page 2 through the final page
 *
 * Returns sorted zero-based page indexes.
 */
export function parsePageRange(value, totalPages) {
  if (!Number.isInteger(totalPages) || totalPages < 1) {
    throw new Error("The PDF has no pages.");
  }

  const input = String(value ?? "")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (!input || input === "all") {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const selected = new Set();

  for (const part of input.split(",")) {
    const match = /^(\d+)(?:-(\d*))?$/.exec(part);

    if (!match) {
      throw new Error("Invalid page range. Use all, 2-5,8 or 2-.");
    }

    const from = Number(match[1]);

    let to = from;

    if (match[2] === "") {
      to = totalPages;
    } else if (match[2] !== undefined) {
      to = Number(match[2]);
    }

    if (
      !Number.isSafeInteger(from) ||
      !Number.isSafeInteger(to) ||
      from < 1 ||
      to > totalPages ||
      from > to
    ) {
      throw new Error(`Page range must be between 1 and ${totalPages}.`);
    }

    for (let page = from; page <= to; page++) {
      selected.add(page - 1);
    }
  }

  if (!selected.size) {
    throw new Error("Select at least one page.");
  }

  return [...selected].sort((a, b) => a - b);
}

function createNumberText(number, total, format) {
  switch (format) {
    case "number":
      return String(number);

    case "page":
      return `Page ${number}`;

    case "of":
      return `Page ${number} of ${total}`;

    default:
      throw new Error("Unsupported page number format.");
  }
}

/**
 * Returns PDF coordinates adjusted for page rotation.
 * Positions are based on the visible crop box.
 */
function getTextPlacement(page, position, textWidth, fontSize, margin) {
  const crop = page.getCropBox();

  const rotation = ((page.getRotation().angle % 360) + 360) % 360;

  if (![0, 90, 180, 270].includes(rotation)) {
    throw new Error("Unsupported PDF page rotation.");
  }

  const sideways = rotation === 90 || rotation === 270;

  const width = sideways ? crop.height : crop.width;
  const height = sideways ? crop.width : crop.height;

  if (textWidth + margin * 2 > width || fontSize + margin * 2 > height) {
    throw new Error(
      "The page number does not fit. Reduce the font size or margin.",
    );
  }

  let visualX;

  if (position.endsWith("left")) {
    visualX = margin;
  } else if (position.endsWith("right")) {
    visualX = width - margin - textWidth;
  } else {
    visualX = (width - textWidth) / 2;
  }

  const visualY = position.startsWith("top")
    ? height - margin - fontSize
    : margin;

  const { x: ox, y: oy } = crop;

  switch (rotation) {
    case 90:
      return {
        x: ox + crop.width - visualY,
        y: oy + visualX,
        rotation,
      };

    case 180:
      return {
        x: ox + crop.width - visualX,
        y: oy + crop.height - visualY,
        rotation,
      };

    case 270:
      return {
        x: ox + visualY,
        y: oy + crop.height - visualX,
        rotation,
      };

    default:
      return {
        x: ox + visualX,
        y: oy + visualY,
        rotation: 0,
      };
  }
}

/**
 * Adds page numbers and returns the modified PDF bytes.
 *
 * This function processes the document locally.
 * No server request is made.
 */
export async function addPageNumbersToPdf(file, options = {}) {
  const {
    pageRange = "all",
    position = "bottom-center",
    format = "page",
    startNumber = 1,
    fontSize = 12,
    margin = 24,
    color = "black",
  } = options;

  const start = Number(startNumber);
  const size = Number(fontSize);
  const spacing = Number(margin);

  if (!Number.isSafeInteger(start) || start < 1 || start > 100000) {
    throw new Error("Starting number must be between 1 and 100000.");
  }

  if (!Number.isFinite(size) || size < 8 || size > 36) {
    throw new Error("Font size must be between 8 and 36.");
  }

  if (!Number.isFinite(spacing) || spacing < 12 || spacing > 80) {
    throw new Error("Margin must be between 12 and 80.");
  }

  if (!POSITIONS.includes(position)) {
    throw new Error("Invalid page number position.");
  }

  if (!COLORS[color]) {
    throw new Error("Invalid page number color.");
  }

  const inputBytes =
    typeof file?.arrayBuffer === "function" ? await file.arrayBuffer() : file;

  const pdfDoc = await PDFDocument.load(inputBytes, {
    updateMetadata: false,
  });

  const totalPages = pdfDoc.getPageCount();

  const selectedIndexes = parsePageRange(pageRange, totalPages);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();

  // "Page 1 of 5" means five numbered pages,
  // even if the original PDF contains more pages.
  const finalNumber = start + selectedIndexes.length - 1;

  selectedIndexes.forEach((pageIndex, index) => {
    const page = pages[pageIndex];
    const currentNumber = start + index;

    const text = createNumberText(currentNumber, finalNumber, format);

    const textWidth = font.widthOfTextAtSize(text, size);

    const placement = getTextPlacement(
      page,
      position,
      textWidth,
      size,
      spacing,
    );

    page.drawText(text, {
      x: placement.x,
      y: placement.y,
      size,
      font,
      color: COLORS[color],
      rotate: degrees(placement.rotation),
    });
  });

  const bytes = await pdfDoc.save();

  return {
    bytes,
    totalPages,
    numberedPages: selectedIndexes.length,
  };
}
