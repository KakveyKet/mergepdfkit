<script setup>
import { ref } from 'vue'
import { formatBytes } from '~/utils/files.mjs'
import { validatePdfUpload, inspectPdf, TOOL_MAX_PDF_BYTES } from '~/utils/pdf-toolkit.mjs'
const props = defineProps({ disabled: { type: Boolean, default: false } })
const emit = defineEmits(['selected', 'error'])
const picker = ref(null)
const dragOver = ref(false)
const checking = ref(false)
function openPicker() { if (!props.disabled && !checking.value) picker.value?.click() }
async function choose(file) {
  const reason = validatePdfUpload(file)
  if (reason) { emit('error', reason); return }
  checking.value = true
  try {
    const info = await inspectPdf(file)
    emit('selected', { file, pageCount: info.pageCount })
  } catch (error) { emit('error', error.message || 'Unable to open this PDF.') }
  finally { checking.value = false }
}
function onInput(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (file) void choose(file)
}
function onDrop(event) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) void choose(file)
}
</script>
<template>
  <div class="rounded-2xl border-2 border-dashed p-7 text-center transition-colors sm:p-10" :class="dragOver ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-[#f8fbff]'" @dragenter.prevent="dragOver = true" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="onDrop">
    <input ref="picker" type="file" class="sr-only" accept=".pdf,application/pdf" aria-label="Choose a PDF" :disabled="disabled || checking" @change="onInput" />
    <span aria-hidden="true" class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">📄</span>
    <h2 class="mt-4 text-lg font-extrabold text-ink">Select your PDF</h2>
    <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Choose a PDF from your device or drop it here. Your file is processed in this browser.</p>
    <button type="button" class="btn-primary mt-5" :disabled="disabled || checking" @click="openPicker">{{ checking ? 'Checking PDF…' : 'Choose PDF file' }}</button>
    <p class="mt-3 text-xs text-slate-500">PDF files up to {{ formatBytes(TOOL_MAX_PDF_BYTES) }} · No upload to our server</p>
  </div>
</template>
