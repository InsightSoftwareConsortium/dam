import test from 'ava'

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

import expectedCid from './support/expectedCid.js'

test('cid subcommand should return the expected cid', t => {
  const testDir = 'test'
  const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
  const archivePath = path.join(testDir, 'cid.tar.gz')

  if (fs.existsSync(archivePath)) {
    fs.rmSync(archivePath)
  }
  const downloadRun = spawnSync('node', [cliPath, 'download', '--verbose', path.join(testDir, 'download-data'), archivePath, expectedCid, `https://w3s.link/ipfs/${expectedCid}`], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  if (downloadRun.status !== 0) {
    t.fail()
  }

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