import test from 'ava'

import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

import expectedCid from './support/expectedCid.js'
import { expectedBz2Cid } from './support/expectedCid.js'

test('download downloads the archive and verifies the cid', t => {
  const testDir = 'test'
  const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
  const archivePath = path.join(testDir, 'download.tar.gz')

  if (fs.existsSync(archivePath)) {
    fs.rmSync(archivePath)
  }
  const downloadRun = spawnSync('node', [cliPath, 'download', '--verbose', path.join(testDir, 'download-data'), archivePath, expectedCid, `https://itk.mypinata.cloud/ipfs/${expectedCid}`], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  if (downloadRun.status !== 0) {
    t.fail()
  }

  t.pass()
})

test('download downloads a bz2 archive and verifies the cid', t => {
  const testDir = 'test'
  const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
  const archivePath = path.join(testDir, 'download.tar.bz2')

  if (fs.existsSync(archivePath)) {
    fs.rmSync(archivePath)
  }
  const downloadRun = spawnSync('node', [cliPath, 'download', '--verbose', path.join(testDir, 'download-data'), archivePath, expectedBz2Cid, `https://itk.mypinata.cloud/ipfs/${expectedBz2Cid}`], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  if (downloadRun.status !== 0) {
    t.fail()
  }

  t.pass()
})

test('download replaces an existing archive that does not match the cid', t => {
  const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dam-download-'))
  t.teardown(() => fs.rmSync(tmpDir, { recursive: true }))
  const archivePath = path.join(tmpDir, 'download.tar.gz')
  const outputDir = path.join(tmpDir, 'download-data')
  fs.writeFileSync(archivePath, 'stale archive')

  const downloadRun = spawnSync('node', [cliPath, 'download', '--verbose', outputDir, archivePath, expectedCid, `https://itk.mypinata.cloud/ipfs/${expectedCid}`], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  t.is(downloadRun.status, 0)
  t.regex(downloadRun.stdout.toString(), /Data archive does not match expected CID\. Downloading\.\.\./)

  const cidRun = spawnSync('node', [cliPath, 'cid', archivePath], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  t.is(cidRun.stdout.toString(), `CID: ${expectedCid}\n`)
  t.true(fs.existsSync(path.join(outputDir, 'cthead1.png')))
})
