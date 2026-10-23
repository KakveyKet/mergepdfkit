export const MAX_FILES = 20
export const MAX_FILE_BYTES = 30 * 1024 * 1024
export const MAX_TOTAL_BYTES = 100 * 1024 * 1024

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

export function moveItem(items, from, to) {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) return [...items]
  const next = [...items]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}

export function checkFile(file, currentCount, totalBytes) {
  if (currentCount >= MAX_FILES) return `You can merge up to ${MAX_FILES} files at a time.`
  if (!file.name.toLowerCase().endsWith('.pdf')) return `${file.name}: only .pdf files are supported.`
  if (file.size === 0) return `${file.name} is empty.`
  if (file.size > MAX_FILE_BYTES) return `${file.name} exceeds the 30 MB per-file limit.`
  if (totalBytes + file.size > MAX_TOTAL_BYTES) return 'The combined files exceed the 100 MB total limit.'
  return null
}

/** Produce a portable name for downloaded PDFs; no filesystem paths or unsupported characters. */
export function safePdfName(input) {
  const base = String(input || 'merged').replace(/\.pdf$/i, '').replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, '').replace(/\.+$/g, '').trim().slice(0, 95)
  return `${base || 'merged'}.pdf`
}
