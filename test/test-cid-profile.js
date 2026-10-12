import test from 'ava'

import fs from 'fs'
import os from 'os'
import path from 'path'
import { createCipheriv, createHash } from 'crypto'
import { spawnSync } from 'child_process'

import { fileURLToPath } from 'url'

// unixfs-v1-2025 test fixtures from IPIP-499
// https://specs.ipfs.tech/ipips/ipip-0499/#test-fixtures

// Deterministic bytes matching kubo's DeterministicRandomReader: the ChaCha20
// keystream with key sha256(seed), a zero nonce, and a zero block counter
function deterministicRandomBytes(size, seed) {
  const key = createHash('sha256').update(seed).digest()
  const cipher = createCipheriv('chacha20', key, Buffer.alloc(16))
  return Buffer.concat([cipher.update(Buffer.alloc(size)), cipher.final()])
}

const fixtures = [
  {
    title: 'small file',
    content: () => Buffer.from('hello world'),
    expectedCid: 'bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e',
  },
  {
    title: 'file at chunk size (1 MiB, single raw leaf)',
    content: () => deterministicRandomBytes(1048576, 'chunk-v1-seed'),
    expectedCid: 'bafkreiacndfy443ter6qr2tmbbdhadvxxheowwf75s6zehscklu6ezxmta',
  },
  {
    title: 'file over chunk size (1 MiB + 1 byte, two raw leaves)',
    content: () => deterministicRandomBytes(1048577, 'chunk-v1-seed'),
    expectedCid: 'bafybeigmix7t42i6jacydtquhet7srwvgpizfg7gjbq7627d35mjomtu64',
  },
]

for (const { title, content, expectedCid } of fixtures) {
  test(`cid matches the unixfs-v1-2025 fixture for a ${title}`, t => {
    const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js')
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dam-cid-profile-'))
    t.teardown(() => fs.rmSync(tmpDir, { recursive: true }))
    const filePath = path.join(tmpDir, 'fixture.bin')
    fs.writeFileSync(filePath, content())

    const cidRun = spawnSync('node', [cliPath, 'cid', filePath], {
      env: process.env,
      stdio: ['inherit', 'pipe', 'inherit'],
    })
    t.is(cidRun.status, 0)
    t.is(cidRun.stdout.toString(), `CID: ${expectedCid}\n`)
  })
}
