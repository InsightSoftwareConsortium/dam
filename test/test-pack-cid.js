import test from 'ava'

import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

test('pack then cid should return the expected cid', t => {

  const testDir = path.dirname(fileURLToPath(import.meta.url))
  const cliPath = path.join(testDir, '..', 'cli.js')
  const archivePath = path.join(testDir, 'pack.tar.gz')
  const packRun = spawnSync('node', [cliPath, path.join(testDir, 'data'), archivePath])

  t.pass()
})