import test from 'ava'

import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

test('pack then cid should return the expected cid', t => {

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
  t.deepEqual(packRun.stdout.toString(), 'CID: bafkreihprgukjht4w4m5nzlb56ytgufdrxa7ixjn574zqvlcsbzjpmykgu\n')

  t.pass()
})