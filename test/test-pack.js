import test from 'ava'

import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

test('pack packs then returns the expected cid', t => {

  const testDir = path.dirname(fileURLToPath(import.meta.url))
  const cliPath = path.join(testDir, '..', 'cli.js')
  const archivePath = path.join(testDir, 'pack.tar.gz')
  const packRun = spawnSync('node', [cliPath, 'pack', path.join(testDir, 'data'), archivePath], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  if (packRun.status !== 0) {
    t.fail()
  }
  t.deepEqual(packRun.stdout.toString(), 'CID: bafkreicwiqbddmj6gzsgxa2ajz54atxcr7ikrti22evy4cznbrknjnaa44\n')

  t.pass()
})