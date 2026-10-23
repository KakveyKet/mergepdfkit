import test from 'node:test'
import assert from 'node:assert/strict'
import { checkFile, formatBytes, MAX_FILES, MAX_FILE_BYTES, MAX_TOTAL_BYTES, moveItem, safePdfName } from '../app/utils/files.mjs'

test('formats bytes for display', () => {
  assert.equal(formatBytes(0), '0 B')
  assert.equal(formatBytes(1024), '1.0 KB')
  assert.equal(formatBytes(1024 ** 2 * 2), '2.0 MB')
})
test('moves the requested file, leaving the original list untouched', () => {
  const original = ['cover', 'report', 'appendix']
  assert.deepEqual(moveItem(original, 2, 0), ['appendix', 'cover', 'report'])
  assert.deepEqual(original, ['cover', 'report', 'appendix'])
  assert.deepEqual(moveItem(original, -1, 1), original)
})
test('enforces PDF file limits', () => {
  const f = { name: 'test.pdf', size: 1024 }
  assert.equal(checkFile(f, 0, 0), null)
  assert.match(checkFile({ ...f, name: 'test.txt' }, 0, 0), /\.pdf/)
  assert.match(checkFile({ ...f, size: 0 }, 0, 0), /empty/)
  assert.match(checkFile({ ...f, size: MAX_FILE_BYTES + 1 }, 0, 0), /30 MB/)
  assert.match(checkFile(f, MAX_FILES, 0), /up to 20/)
  assert.match(checkFile(f, 0, MAX_TOTAL_BYTES), /100 MB/)
})

test('produces a safe portable output PDF filename', () => {
  assert.equal(safePdfName('report.pdf'), 'report.pdf')
  assert.equal(safePdfName('2026/summary?.pdf'), '2026summary.pdf')
  assert.equal(safePdfName('   '), 'merged.pdf')
})
