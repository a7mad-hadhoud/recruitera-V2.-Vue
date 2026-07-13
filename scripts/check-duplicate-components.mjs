#!/usr/bin/env node
// Heuristic duplicate-component finder.
//
// This is what would have caught BrandFilterGroup vs FilterGroupHeader
// before they shipped as two parallel implementations of the same thing:
// two components whose PascalCase name breaks into the same bag of words
// (ignoring the generic "Brand" prefix) are very likely solving the same
// problem twice. Not a proof — just a prompt to go compare them by hand.
//
// Run: node scripts/check-duplicate-components.mjs

import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const COMPONENTS_DIR = join(ROOT, 'app/components')

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      // shadcn-vue primitives are generated/vendored — not part of this audit
      if (entry === 'ui') continue
      walk(full, out)
    } else if (entry.endsWith('.vue')) {
      out.push(full)
    }
  }
  return out
}

function wordsOf(filename) {
  const base = filename.replace(/\.vue$/, '')
  const words = base.match(/[A-Z][a-z0-9]*/g) ?? [base]
  return new Set(words.filter(w => w.toLowerCase() !== 'brand').map(w => w.toLowerCase()))
}

function sameSet(a, b) {
  if (a.size !== b.size) return false
  for (const w of a) if (!b.has(w)) return false
  return true
}

function isSubset(a, b) {
  for (const w of a) if (!b.has(w)) return false
  return true
}

const files = walk(COMPONENTS_DIR)
const entries = files.map(f => ({ file: f, name: f.split('/').pop(), words: wordsOf(f.split('/').pop()) }))

const flagged = []
for (let i = 0; i < entries.length; i++) {
  for (let j = i + 1; j < entries.length; j++) {
    const a = entries[i]
    const b = entries[j]
    if (a.words.size === 0 || b.words.size === 0) continue
    if (sameSet(a.words, b.words) || isSubset(a.words, b.words) || isSubset(b.words, a.words)) {
      flagged.push([a, b])
    }
  }
}

if (flagged.length === 0) {
  console.log('No likely duplicate components found.')
  process.exit(0)
}

console.log(`Found ${flagged.length} likely duplicate component pair(s):\n`)
for (const [a, b] of flagged) {
  console.log(`  ${relative(ROOT, a.file)}`)
  console.log(`  ${relative(ROOT, b.file)}`)
  console.log('')
}
console.log('Compare each pair by hand — consolidate onto one canonical component if they solve the same problem.')
process.exit(1)
