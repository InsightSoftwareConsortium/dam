import fs from 'fs'
import path from 'path'
import util from 'util'
import stream from 'stream'
const pipeline = util.promisify(stream.pipeline)

import * as tar from 'tar'
import { importFile } from 'ipfs-unixfs-importer'
import { BlackHoleBlockstore } from 'blockstore-core/black-hole'
import decompress from 'decompress'

import axios from 'axios'

export async function pack(dir, archivePath) {
  if (!fs.existsSync(dir)) {
    console.error(`${dir} does not exist`)
    process.exit(1)
  }

  // portable drops owner, umask, and OS details so the same files always
  // produce the same archive bytes, and therefore the same CID
  await tar.c({
    gzip: { level: 9 },
    file: archivePath,
    C: dir,
    portable: true,
    // Same fixed timestamp as npm pack
    mtime: new Date('1985-10-26T08:15:00.000Z'),
    noDirRecurse: true,
  },
  ['.', ...sortedEntries(dir, '.')])
}

// Sorted, since readdir order depends on the filesystem. Symlinks are stored,
// not followed, like node-tar's own directory recursion.
function sortedEntries(dir, prefix) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name < b.name ? -1 : 1)
    .flatMap(dirent => {
      const entry = `${prefix}/${dirent.name}`
      return dirent.isDirectory()
        ? [entry, ...sortedEntries(path.join(dir, dirent.name), entry)]
        : [entry]
    })
}

// IPIP-499 CID profile: CIDv1, sha2-256, raw leaves, 1 MiB chunks,
// balanced layout with 1024 links per node.
// https://specs.ipfs.tech/ipips/ipip-0499/
const cidProfile = 'unixfs-v1-2025'

export async function cid(archivePath) {
  // Only the root CID is needed, so the blocks are discarded as they are built
  const { cid: rootCid } = await importFile(
    { content: fs.createReadStream(archivePath) },
    new BlackHoleBlockstore(),
    { profile: cidProfile }
  )

  return rootCid.toString()
}

export async function download(dir, archivePath, rootCid, urls, options = {}) {
  const { retries = 3, verbose = false } = options

  let needToDownload = false
  if (!fs.existsSync(archivePath)) {
    if (verbose) {
      console.log('Data archive not found. Downloading...')
    }
    needToDownload = true
  } else {
    const currentCid = await cid(archivePath)
    if (currentCid.trim() !== rootCid.trim()) {
      console.log('Data archive does not match expected CID. Downloading...')
      needToDownload = true
    }
  }

  let downloadSucceeded = false
  if (needToDownload) {
    try {
      fs.mkdirSync(path.dirname(archivePath), { recursive: true })
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
    for (const url of urls) {
      for (let retry = 0; retry < retries; retry++) {
        if (verbose) {
          console.log(`Downloading ${url}, attempt ${retry}...`)
        }
        const request = await axios.get(url, { responseType: 'stream' })
        await pipeline(request.data, fs.createWriteStream(archivePath))
        const currentCid = await cid(archivePath)
        if (currentCid.trim() === rootCid.trim()) {
          downloadSucceeded = true
          break
        }
      }
      if (downloadSucceeded) {
        break
      }
    }
  }

  if (downloadSucceeded) {
    if (verbose) {
      console.log(`Unpacking ${archivePath} to ${dir}`)
    }
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
    try {
      await decompress(archivePath, dir)
    } catch (err) {
      fs.rmSync(archivePath)
      throw err
    }
  }
}
