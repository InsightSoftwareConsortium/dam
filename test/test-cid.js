import test from 'ava'

import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

import expectedCid from './support/expectedCid.js'

test('cid subcommand should return the expected cid', t => {
  const testDir = 'test'
  const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
  const archivePath = path.join(testDir, 'cid.tar.gz')
  const packRun = spawnSync('node', [cliPath, 'pack', path.join(testDir, 'data'), archivePath], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  if (packRun.status !== 0) {
    t.fail()
  }
  t.deepEqual(packRun.stdout.toString(), `CID: ${expectedCid}\n`)

  const cidRun = spawnSync('node', [cliPath, 'cid', archivePath], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  if (cidRun.status !== 0) {
    t.fail()
  }
  t.deepEqual(cidRun.stdout.toString(), `CID: ${expectedCid}\n`)

  t.pass()
})