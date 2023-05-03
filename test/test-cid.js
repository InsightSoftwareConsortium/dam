import test from 'ava'

import path from 'path'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

test('cid subcommand should return the expected cid', t => {

  const testDir = path.dirname(fileURLToPath(import.meta.url))
  const cliPath = path.join(testDir, '..', 'cli.js')
  const archivePath = path.join(testDir, 'cid.tar.gz')
  const packRun = spawnSync('node', [cliPath, 'pack', path.join(testDir, 'data'), archivePath], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  if (packRun.status !== 0) {
    t.fail()
  }
  t.deepEqual(packRun.stdout.toString(), 'CID: bafkreicwiqbddmj6gzsgxa2ajz54atxcr7ikrti22evy4cznbrknjnaa44\n')

  const cidRun = spawnSync('node', [cliPath, 'cid', archivePath], {
    env: process.env,
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  if (cidRun.status !== 0) {
    t.fail()
  }
  t.deepEqual(packRun.stdout.toString(), 'CID: bafkreicwiqbddmj6gzsgxa2ajz54atxcr7ikrti22evy4cznbrknjnaa44\n')

  t.pass()
})