import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
const root = process.cwd()
const pages = [
  'index', 'merge-pdf', 'guides/index', 'about', 'contact', 'privacy-policy', 'terms',
  'guides/how-to-merge-pdf', 'guides/is-online-pdf-merging-safe',
  'guides/organize-pdf-files', 'guides/fix-pdf-merge-problems', 'guides/choose-pdf-order'
]
test('all important prerender pages exist', async () => {
  for (const page of pages) {
    const source = await readFile(join(root, 'app', 'pages', `${page}.vue`), 'utf8')
    assert.match(source, /usePageSeo/)
  }
})
test('starter does not include live AdSense code', async () => {
  const source = await readFile(join(root, 'app', 'app.vue'), 'utf8')
  assert.doesNotMatch(source, /adsbygoogle|googlesyndication/)
})
