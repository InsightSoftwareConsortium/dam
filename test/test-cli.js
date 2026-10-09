import test from 'ava'

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

test('help lists the subcommands', t => {
  const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
  const helpRun = spawnSync('node', [cliPath, '--help'], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  t.is(helpRun.status, 0)

  const helpOutput = helpRun.stdout.toString()
  t.regex(helpOutput, /Usage: dam/)
  t.regex(helpOutput, /pack <dir> <archive>/)
  t.regex(helpOutput, /cid <archive>/)
  t.regex(helpOutput, /download \[options\] <dir> <archive> <cid> <urls\.\.\.>/)
})

test('download accepts the retries option and skips downloading a matching archive', t => {
  const testDir = 'test'
  const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
  const archivePath = path.join(testDir, 'cli.tar.gz')
  const outputDir = path.join(testDir, 'cli-data')

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true })
  }

  const packRun = spawnSync('node', [cliPath, 'pack', path.join(testDir, 'data'), archivePath], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  t.is(packRun.status, 0)
  const packedCid = packRun.stdout.toString().match(/^CID: (\S+)$/m)[1]

  // The url is unreachable, so this only succeeds if the existing archive is used
  const downloadRun = spawnSync('node', [cliPath, 'download', '--retries', '2', '--verbose', outputDir, archivePath, packedCid, 'http://127.0.0.1:9/unreachable.tar.gz'], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  t.is(downloadRun.status, 0)
  t.false(fs.existsSync(outputDir))
})
