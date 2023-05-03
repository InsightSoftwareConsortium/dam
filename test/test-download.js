import test from 'ava'

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

import expectedCid from './support/expectedCid.js'

test('download downloads the archive and verifies the cid', t => {
  const testDir = 'test'
  const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
  const archivePath = path.join(testDir, 'download.tar.gz')

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

  t.pass()
})