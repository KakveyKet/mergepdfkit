<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { formatBytes } from '~/utils/files.mjs'
import { parsePageSelection, normalizedRotation, createDownload, triggerDownload, revokeDownloads } from '~/utils/pdf-toolkit.mjs'
usePageSeo({ title: 'Rotate PDF Pages Online Free | PDFEasy', description: 'Rotate one page or every page in your PDF by 90°, 180°, or 270°. Free, private browser processing.', path: '/rotate-pdf' })
const selected = ref(null), scope = ref('all'), ranges = ref('1'), angle = ref(90), name = ref('rotated.pdf'), busy = ref(false), error = ref(''), result = ref([])
function resetResult() { revokeDownloads(result.value); result.value = [] }
onBeforeUnmount(resetResult)
function onSelected(value) { selected.value = value; error.value = ''; resetResult(); ranges.value = '1' }
async function rotate() {
  if (!selected.value || busy.value) return
  error.value = ''; resetResult(); busy.value = true
  try {
    const { PDFDocument, degrees } = await import('pdf-lib')
    const pdf = await PDFDocument.load(await selected.value.file.arrayBuffer(), { updateMetadata: false })
    const pages = pdf.getPages()
    const indexes = scope.value === 'all' ? pages.map((_, i) => i) : parsePageSelection(ranges.value, pages.length)
    for (const index of indexes) { const page = pages[index]; page.setRotation(degrees(normalizedRotation(page.getRotation().angle, Number(angle.value)))) }
    const item = createDownload(await pdf.save({ useObjectStreams: true }), name.value)
    result.value = [item]; triggerDownload(item)
  } catch (e) { error.value = e.message || 'Could not rotate this PDF.' }
  finally { busy.value = false }
}
</script>
<template>
  <ToolLayout eyebrow="Fix document orientation" title="Rotate PDF online" description="Turn sideways or upside-down pages the right way around, without installing software." :steps="['Choose a PDF with pages that need turning.', 'Select all pages or enter the specific page numbers.', 'Choose a rotation, then save the corrected PDF.']" note="Rotations apply relative to the current page orientation. Signed PDFs and some interactive forms may be affected when saved again." :faqs="[['Can I rotate only page 2?', 'Yes. Select Specific pages and enter 2.'], ['Will rotation alter the page content?', 'The page is rotated without turning it into an image. Review complex PDFs after saving.']]" :related="[{label:'Organize PDF pages', to:'/organize-pdf'},{label:'Merge PDF files',to:'/merge-pdf'}]">
    <div class="surface-card p-5 sm:p-8">
      <SinglePdfSelect :disabled="busy" @selected="onSelected" @error="error = $event" />
      <div v-if="selected" class="mt-6 space-y-5">
        <p class="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong class="break-all">{{ selected.file.name }}</strong> · {{ selected.pageCount }} pages · {{ formatBytes(selected.file.size) }}</p>
        <fieldset><legend class="text-sm font-bold">Choose pages</legend><div class="mt-2 flex flex-wrap gap-5 text-sm"><label class="flex items-center gap-2"><input v-model="scope" type="radio" value="all" :disabled="busy" /> All pages</label><label class="flex items-center gap-2"><input v-model="scope" type="radio" value="custom" :disabled="busy" /> Specific pages</label></div></fieldset>
        <label v-if="scope === 'custom'" class="block text-sm font-semibold">Pages (for example, 1, 3-5)<input v-model="ranges" class="tool-input mt-2" :disabled="busy" /></label>
        <fieldset><legend class="text-sm font-bold">Rotate clockwise</legend><div class="mt-3 grid grid-cols-3 gap-3"><label v-for="option in [90, 180, 270]" :key="option" class="cursor-pointer rounded-xl border p-4 text-center text-sm font-bold" :class="angle === option ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'"><input v-model.number="angle" type="radio" :value="option" name="rotation" class="sr-only" :disabled="busy" /> ↻ {{ option }}°</label></div></fieldset>
        <label class="block text-sm font-semibold">Download filename<input v-model="name" maxlength="100" class="tool-input mt-2" :disabled="busy" /></label>
        <button type="button" class="btn-primary w-full sm:w-auto" :disabled="busy" @click="rotate">{{ busy ? 'Rotating…' : 'Rotate & download PDF' }}</button>
      </div>
      <p v-if="error" role="alert" class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{{ error }}</p>
      <PdfDownloadResults :items="result" />
    </div>
    <template #article><h2>Fix scanned and sideways PDF pages</h2><p>Scans and mobile phone documents sometimes have the wrong orientation. You can rotate a whole document, or target only the incorrectly oriented pages. For example, rotate pages 1, 4 and 6 clockwise by 90 degrees while leaving every other page unchanged.</p><p>The tool updates the PDF page rotation. It does not rephotograph or rasterize each page. This usually keeps text selectable, but edited PDF files should always be checked when they contain forms or digital signatures.</p></template>
  </ToolLayout>
</template>
