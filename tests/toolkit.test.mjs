import test from 'node:test'
import assert from 'node:assert/strict'
import { parsePageSelection, normalizedRotation, moveIndexed, sanitizePdfFilename, validateImageUpload, validatePdfUpload, TOOL_MAX_IMAGES } from '../app/utils/pdf-toolkit.mjs'

test('page ranges preserve input order and remove duplicates', () => {
  assert.deepEqual(parsePageSelection('3-5, 1, 4, 7', 8), [2,3,4,0,6])
  assert.deepEqual(parsePageSelection('2', 2), [1])
})
test('page ranges reject invalid/out-of-bounds selections', () => {
  for (const value of ['0', '9', '5-2', 'hello', '2-', '1,,2', '1-4000']) {
    assert.throws(() => parsePageSelection(value, 8))
  }
})
test('rotation preserves existing page orientation', () => {
  assert.equal(normalizedRotation(270,90),0)
  assert.equal(normalizedRotation(90,180),270)
  assert.equal(normalizedRotation(0,270),270)
  assert.throws(() => normalizedRotation(45,90))
})
test('page ordering is stable and immutable', () => {
  const original = [1,2,3]
  assert.deepEqual(moveIndexed(original,0,2),[2,3,1])
  assert.deepEqual(original,[1,2,3])
})
test('download filenames are sanitized', () => {
  assert.equal(sanitizePdfFilename('abc.pdf'), 'abc.pdf')
  assert.equal(sanitizePdfFilename('../secret?'), 'secret.pdf')
  assert.equal(sanitizePdfFilename(''), 'document.pdf')
})
test('file validation checks size, type, and count', () => {
  assert.equal(validatePdfUpload({name:'file.doc',size:99}), 'Choose a .pdf file.')
  assert.match(validateImageUpload({name:'a.jpg',size:10},TOOL_MAX_IMAGES,0), /no more/)
  assert.match(validateImageUpload({name:'a.gif',size:10},0,0), /JPG/)
})

test('tool catalog links to every implemented tool', async () => {
  const { pdfTools } = await import('../app/utils/toolCatalog.mjs')
  const { access } = await import('node:fs/promises')
  for (const tool of pdfTools) {
    assert.ok(tool.name && tool.to.startsWith('/'))
    await access(`app/pages${tool.to}.vue`)
  }
  assert.equal(pdfTools.length, 5)
})
