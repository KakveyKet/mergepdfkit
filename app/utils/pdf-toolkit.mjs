import { formatBytes } from './files.mjs'

export const TOOL_MAX_PDF_BYTES = 50 * 1024 * 1024
export const TOOL_MAX_IMAGE_BYTES = 20 * 1024 * 1024
export const TOOL_MAX_IMAGES = 30
export const TOOL_MAX_IMAGE_TOTAL = 120 * 1024 * 1024

export function sanitizePdfFilename(input, fallback = 'document') {
  const text = String(input || fallback).replace(/\.pdf$/i, '').replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, '')
    .replace(/^\.+|\.+$/g, '').trim().slice(0, 95)
  return `${text || fallback}.pdf`
}

export function parsePageSelection(input, pageCount) {
  if (!Number.isInteger(pageCount) || pageCount < 1) throw new Error('This PDF has no readable pages.')
  const value = String(input ?? '').trim()
  if (!value) throw new Error('Enter at least one page number (example: 1, 3-5).')
  const result = []
  const seen = new Set()
  for (const chunk of value.split(',')) {
    const token = chunk.trim()
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(token)
    if (!match) throw new Error(`Invalid range "${token || '(empty)'}". Use 1, 3-5, 8.`)
    const start = Number(match[1])
    const end = match[2] ? Number(match[2]) : start
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end > pageCount || start > end) {
      throw new Error(`Pages must be between 1 and ${pageCount}, and range starts cannot exceed ends.`)
    }
    if (end - start > 999) throw new Error('Select fewer pages in one range.')
    for (let num = start; num <= end; num++) {
      if (!seen.has(num)) { result.push(num - 1); seen.add(num) }
    }
  }
  return result
}

export function validatePdfUpload(file) {
  if (!file) return 'Please choose a PDF file.'
  if (!/\.pdf$/i.test(file.name || '')) return 'Choose a .pdf file.'
  if (!file.size) return 'The selected file is empty.'
  if (file.size > TOOL_MAX_PDF_BYTES) return `This PDF is over the ${formatBytes(TOOL_MAX_PDF_BYTES)} browser limit.`
  return ''
}

export function validateImageUpload(file, totalCount, totalBytes) {
  if (totalCount >= TOOL_MAX_IMAGES) return `Choose no more than ${TOOL_MAX_IMAGES} images.`
  if (!/\.(jpg|jpeg|png)$/i.test(file.name || '')) return 'Only JPG, JPEG, and PNG files are supported.'
  if (!file.size) return 'The selected image is empty.'
  if (file.size > TOOL_MAX_IMAGE_BYTES) return `${file.name} is over ${formatBytes(TOOL_MAX_IMAGE_BYTES)}.`
  if (totalBytes + file.size > TOOL_MAX_IMAGE_TOTAL) return `All images combined must stay under ${formatBytes(TOOL_MAX_IMAGE_TOTAL)}.`
  return ''
}

export function normalizedRotation(current, delta) {
  const angle = ((Number(current) + Number(delta)) % 360 + 360) % 360
  if (![0, 90, 180, 270].includes(angle)) throw new Error('Only right-angle rotations are supported.')
  return angle
}

export function moveIndexed(items, from, to) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= items.length || to >= items.length) return [...items]
  const copy = [...items]
  copy.splice(to, 0, copy.splice(from, 1)[0])
  return copy
}

/** Runs only from a browser interaction; never uploads files. */
export function createDownload(bytes, filename) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  return { url, filename: sanitizePdfFilename(filename) }
}

export function triggerDownload(item) {
  const link = document.createElement('a')
  link.href = item.url
  link.download = item.filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function revokeDownloads(items) {
  if (typeof URL === 'undefined') return
  for (const item of items) if (item?.url) URL.revokeObjectURL(item.url)
}

export async function inspectPdf(file) {
  const { PDFDocument } = await import('pdf-lib')
  const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer())
  if (String.fromCharCode(...signature) !== '%PDF-') throw new Error('This file does not look like a valid PDF.')
  let pdf
  try { pdf = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false }) }
  catch (error) {
    throw new Error(/encrypted|password/i.test(`${error?.name} ${error?.message}`)
      ? 'Password-protected PDF files are not supported.'
      : 'This PDF is damaged or unsupported. Try a different file.')
  }
  if (!pdf.getPageCount()) throw new Error('This PDF contains no pages.')
  return { pdf, pageCount: pdf.getPageCount() }
}
