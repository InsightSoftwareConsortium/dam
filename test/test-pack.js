import test from 'ava'

import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'
import * as tar from 'tar'

import { pack } from '../index.js'

test('pack packs a reproducible archive', t => {
  const testDir = 'test'
  const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
  const archivePath = path.join(testDir, 'pack.tar.gz')
  const packRun = spawnSync('node', [cliPath, 'pack', path.join(testDir, 'data'), archivePath], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  t.is(packRun.status, 0)
  // Independent of when, where, and by whom test/data is packed
  t.is(packRun.stdout.toString(), 'CID: bafkreif5qohtzcb4upzzfxukjgsszqoyrcf75uwkcclqogqqfz7qrkgsam\n')
})

test('pack sorts nested entries and omits machine-specific metadata', async t => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dam-pack-'))
  t.teardown(() => fs.rmSync(tmpDir, { recursive: true }))
  const dataDir = path.join(tmpDir, 'data')
  for (const file of ['b.txt', 'a0/c.txt', 'a/b/d.txt', 'a-e.txt']) {
    const filePath = path.join(dataDir, file)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, file)
    fs.chmodSync(filePath, 0o664)
  }
  fs.symlinkSync('a0', path.join(dataDir, 'link'))
  const archivePath = path.join(tmpDir, 'data.tar.gz')
  await pack(dataDir, archivePath)

  const entries = []
  await tar.t({ file: archivePath, onReadEntry: entry => entries.push(entry) })
  t.deepEqual(entries.map(entry => entry.path), ['./', './a/', './a/b/', './a/b/d.txt', './a-e.txt', './a0/', './a0/c.txt', './b.txt', './link'])
  t.is(entries.at(-1).type, 'SymbolicLink')
  for (const entry of entries.filter(entry => entry.type === 'File')) {
    t.is(entry.mode, 0o644)
    t.is(entry.uid, undefined)
    t.is(entry.mtime.toISOString(), '1985-10-26T08:15:00.000Z')
  }
})
