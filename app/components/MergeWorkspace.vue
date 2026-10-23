<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { checkFile, formatBytes, MAX_FILES, MAX_TOTAL_BYTES, moveItem, safePdfName } from '~/utils/files.mjs'

const picker = ref(null)
const files = ref([])
const busy = ref(false)
const merging = ref(false)
const draggingOver = ref(false)
const draggedIndex = ref(-1)
const processedCount = ref(0)
const outputName = ref('merged.pdf')
const error = ref('')
const status = ref('')
const downloadUrl = ref('')
let nextId = 1

const totalSize = computed(() => files.value.reduce((sum, item) => sum + item.file.size, 0))
const totalPages = computed(() => files.value.reduce((sum, item) => sum + item.pages, 0))
const canMerge = computed(() => files.value.length >= 2 && !busy.value && !merging.value)
const progressPercent = computed(() => files.value.length ? Math.round(processedCount.value / files.value.length * 100) : 0)

function resetResult() {
  if (downloadUrl.value && import.meta.client) URL.revokeObjectURL(downloadUrl.value)
  downloadUrl.value = ''
  status.value = ''
}
onBeforeUnmount(resetResult)
function openPicker() { if (!busy.value && !merging.value) picker.value?.click() }
function onInput(event) {
  const selected = [...(event.target.files || [])]
  event.target.value = ''
  void addFiles(selected)
}
async function addFiles(selected) {
  if (!selected.length || busy.value || merging.value) return
  busy.value = true
  resetResult()
  error.value = ''
  status.value = 'Checking your files…'
  let count = files.value.length
  let bytes = totalSize.value
  const added = []
  const rejected = []
  try {
    const { PDFDocument } = await import('pdf-lib')
    for (const file of selected) {
      const problem = checkFile(file, count, bytes)
      if (problem) { rejected.push(problem); continue }
      try {
        const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer())
        if (String.fromCharCode(...signature) !== '%PDF-') {
          rejected.push(`${file.name}: not a valid PDF.`)
          continue
        }
        const pdf = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false })
        const pages = pdf.getPageCount()
        if (!pages) { rejected.push(`${file.name}: no pages found.`); continue }
        added.push({ id: nextId++, file, pages })
        count++
        bytes += file.size
      } catch (exception) {
        rejected.push(/encrypt|password/i.test(`${exception?.name} ${exception?.message}`)
          ? `${file.name}: locked PDFs are not supported.`
          : `${file.name}: damaged or unsupported PDF.`)
      }
    }
    files.value = [...files.value, ...added]
    error.value = rejected.slice(0, 3).join(' ') + (rejected.length > 3 ? ` (+${rejected.length - 3} more)` : '')
    status.value = added.length ? `${added.length} PDF${added.length === 1 ? '' : 's'} added. Review the order below.` : ''
  } catch {
    error.value = 'The PDF processor could not start. Reload the page and try again.'
    status.value = ''
  } finally { busy.value = false }
}
function onDropZone(event) {
  draggingOver.value = false
  void addFiles([...(event.dataTransfer?.files || [])])
}
function move(from, to) {
  if (busy.value || merging.value) return
  files.value = moveItem(files.value, from, to)
  resetResult()
}
function dropOn(index) {
  if (draggedIndex.value >= 0) move(draggedIndex.value, index)
  draggedIndex.value = -1
}
function removeFile(id) {
  if (busy.value || merging.value) return
  files.value = files.value.filter(item => item.id !== id)
  error.value = ''
  resetResult()
}
function clearFiles() {
  if (busy.value || merging.value) return
  files.value = []
  error.value = ''
  resetResult()
}
function triggerDownload() {
  if (!downloadUrl.value || !import.meta.client) return
  const a = document.createElement('a')
  a.href = downloadUrl.value
  a.download = safePdfName(outputName.value)
  document.body.appendChild(a)
  a.click()
  a.remove()
}
async function mergeFiles() {
  if (!canMerge.value) return
  resetResult()
  merging.value = true
  processedCount.value = 0
  error.value = ''
  status.value = 'Starting your merge…'
  try {
    const { PDFDocument } = await import('pdf-lib')
    const target = await PDFDocument.create()
    for (const item of files.value) {
      status.value = `Combining ${item.file.name}…`
      const source = await PDFDocument.load(await item.file.arrayBuffer(), { updateMetadata: false })
      const pages = await target.copyPages(source, source.getPageIndices())
      pages.forEach(page => target.addPage(page))
      processedCount.value++
    }
    status.value = 'Creating your final PDF…'
    const bytes = await target.save({ useObjectStreams: true })
    downloadUrl.value = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
    status.value = `Done! ${totalPages.value} pages have been combined. Your download should start automatically.`
    triggerDownload()
  } catch (exception) {
    error.value = /encrypt|password/i.test(`${exception?.name} ${exception?.message}`)
      ? 'A PDF is locked. Remove that file and try again.'
      : 'These PDFs could not be merged. Try fewer files or smaller documents.'
    status.value = ''
  } finally { merging.value = false }
}
</script>

<template>
  <section class="surface-card overflow-hidden" aria-label="PDF merge workspace">
    <input ref="picker" type="file" accept=".pdf,application/pdf" multiple class="sr-only" aria-label="Select PDF files" :disabled="busy || merging" @change="onInput" />

    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
      <div class="flex items-center gap-3">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-brand" aria-hidden="true">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5M8 14h8M8 17h6"/></svg>
        </span>
        <div>
          <h2 class="text-lg font-bold tracking-tight text-ink">Your PDF workspace</h2>
          <p class="mt-0.5 text-sm text-slate-500">Three steps. One PDF. No account needed.</p>
        </div>
      </div>
      <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">● Processed on your device</span>
    </header>

    <div class="p-4 sm:p-7">
      <ol class="mb-6 grid grid-cols-3 gap-2 text-center sm:gap-4" aria-label="How the tool works">
        <li class="rounded-xl bg-slate-50 px-2 py-3 text-xs font-semibold text-slate-700 sm:text-sm"><span class="step-number">1</span><span class="block sm:inline"> Select files</span></li>
        <li class="rounded-xl bg-slate-50 px-2 py-3 text-xs font-semibold text-slate-700 sm:text-sm"><span class="step-number">2</span><span class="block sm:inline"> Set order</span></li>
        <li class="rounded-xl bg-slate-50 px-2 py-3 text-xs font-semibold text-slate-700 sm:text-sm"><span class="step-number">3</span><span class="block sm:inline"> Download</span></li>
      </ol>

      <div v-if="!files.length" class="rounded-2xl border-2 border-dashed px-5 py-12 text-center transition-colors sm:py-16"
        :class="draggingOver ? 'border-brand bg-blue-100' : 'border-blue-200 bg-[#f8fbff]'"
        @dragenter.prevent="draggingOver = true" @dragover.prevent="draggingOver = true"
        @dragleave.prevent="draggingOver = false" @drop.prevent="onDropZone">
        <span class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-brand shadow-sm" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0L8 8m4-4 4 4M4 16v4h16v-4"/></svg>
        </span>
        <h3 class="mt-5 text-xl font-bold tracking-tight text-ink sm:text-2xl">Choose files to merge</h3>
        <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Select at least two PDFs, or drag and drop them here. You can change their order before merging.</p>
        <button type="button" class="btn-primary mt-6 min-w-52 py-3!" :disabled="busy || merging" @click="openPicker">{{ busy ? 'Checking PDFs…' : 'Select PDF files' }} <span aria-hidden="true">→</span></button>
        <p class="mt-5 text-xs leading-5 text-slate-500">PDF only · Up to {{ MAX_FILES }} files · 30 MB each · {{ formatBytes(MAX_TOTAL_BYTES) }} total</p>
      </div>

      <div v-else class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_295px]">
        <div class="min-w-0">
          <div class="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 class="text-base font-bold text-ink">Files in merge order <span class="ml-1 text-sm font-medium text-slate-500">({{ files.length }})</span></h3>
              <p class="mt-1 text-xs leading-5 text-slate-500">Move up or down to change the page order.</p>
            </div>
            <button type="button" class="rounded-lg px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40" :disabled="busy || merging" @click="clearFiles">Clear all</button>
          </div>
          <ul class="space-y-2" aria-label="PDF files to merge in order">
            <li v-for="(item, index) in files" :key="item.id" class="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 p-3 sm:gap-3" :draggable="!busy && !merging" @dragstart="draggedIndex = index" @dragend="draggedIndex = -1" @dragover.prevent @drop.prevent.stop="dropOn(index)">
              <span class="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-slate-500">{{ index + 1 }}</span>
              <span class="grid h-10 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-xs font-bold text-red-700" aria-hidden="true">PDF</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-slate-800" :title="item.file.name">{{ item.file.name }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ item.pages }} page{{ item.pages === 1 ? '' : 's' }} · {{ formatBytes(item.file.size) }}</p>
              </div>
              <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
                <button type="button" class="file-icon-btn" :disabled="index === 0 || busy || merging" :aria-label="`Move ${item.file.name} up`" title="Move up" @click="move(index, index - 1)">↑</button>
                <button type="button" class="file-icon-btn" :disabled="index === files.length - 1 || busy || merging" :aria-label="`Move ${item.file.name} down`" title="Move down" @click="move(index, index + 1)">↓</button>
                <button type="button" class="file-icon-btn text-red-700!" :disabled="busy || merging" :aria-label="`Remove ${item.file.name}`" title="Remove PDF" @click="removeFile(item.id)">×</button>
              </div>
            </li>
          </ul>
          <div class="mt-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/50" :class="draggingOver ? 'bg-blue-100' : ''" @dragenter.prevent="draggingOver = true" @dragover.prevent="draggingOver = true" @dragleave.prevent="draggingOver = false" @drop.prevent="onDropZone">
            <button type="button" class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-brand hover:bg-blue-50 disabled:opacity-40" :disabled="busy || merging || files.length >= MAX_FILES" @click="openPicker">+ Add more PDF files</button>
          </div>
        </div>

        <aside class="rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-label="Your merge settings">
          <h3 class="font-bold text-ink">Ready to merge</h3>
          <dl class="mt-4 space-y-3 border-b border-slate-200 pb-5 text-sm">
            <div class="flex justify-between"><dt class="text-slate-600">Files</dt><dd class="font-bold text-ink">{{ files.length }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-600">Pages</dt><dd class="font-bold text-ink">{{ totalPages }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-600">Total input</dt><dd class="font-bold text-ink">{{ formatBytes(totalSize) }}</dd></div>
          </dl>
          <label for="pdf-output-name" class="mt-5 block text-sm font-semibold text-ink">Download filename</label>
          <input id="pdf-output-name" v-model="outputName" type="text" maxlength="100" spellcheck="false" autocomplete="off" class="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-blue-500" placeholder="merged.pdf" :disabled="merging" />
          <p class="mt-1.5 text-xs text-slate-500">The .pdf extension is added automatically.</p>
          <button type="button" class="btn-primary mt-5 w-full py-3!" :disabled="!canMerge" @click="mergeFiles">{{ merging ? 'Merging PDFs…' : 'Merge & download PDF' }}</button>
          <p v-if="files.length < 2" class="mt-3 text-center text-xs text-slate-500">Add one more PDF to continue.</p>
          <p v-else class="mt-3 text-center text-xs leading-5 text-slate-500">The original documents stay on your device.</p>
          <div v-if="merging" class="mt-4">
            <progress :value="processedCount" :max="files.length" class="h-2 w-full accent-blue-600" aria-label="PDF merging progress" />
            <p class="mt-2 text-xs text-slate-600">{{ processedCount }} of {{ files.length }} files combined ({{ progressPercent }}%)</p>
          </div>
        </aside>
      </div>

      <div v-if="error" role="alert" class="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{{ error }}</div>
      <div v-if="status" role="status" aria-live="polite" class="mt-5 rounded-xl border px-4 py-3 text-sm leading-6" :class="downloadUrl ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-slate-200 bg-slate-50 text-slate-700'">
        <p>{{ status }}</p>
        <button v-if="downloadUrl" type="button" class="btn-secondary mt-3" @click="triggerDownload">Download PDF again ↓</button>
      </div>
    </div>

    <footer class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs text-slate-600 sm:px-7">
      <span>✓ Browser-based PDF processing</span><NuxtLink to="/guides/is-online-pdf-merging-safe" class="font-semibold text-brand hover:underline">How is my PDF handled? →</NuxtLink>
    </footer>
  </section>
</template>
