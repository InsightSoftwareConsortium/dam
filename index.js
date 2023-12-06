import fs from 'fs'
import path from 'path'
import util from 'util'
import stream from 'stream'
const pipeline = util.promisify(stream.pipeline)

import tar from 'tar'
import { filesFromPaths } from 'files-from-path'
import { createFileEncoderStream } from 'ipfs-car'
import decompress from 'decompress'

import axios from 'axios'

export async function pack(dir, archivePath) {
  if (!fs.existsSync(dir)) {
    console.error(`${dir} does not exist`)
    process.exit(1)
  }

  await tar.c({
    gzip: { level: 9 },
    file: archivePath,
    C: dir,
    mtime: new Date(),
  },
  ['.'])
}

export async function cid(archivePath) {
  const files = await filesFromPaths([archivePath,])

  let rootCid
  await createFileEncoderStream(files[0]).pipeThrough(new TransformStream({
    transform (block, controller) {
      rootCid = block.cid
      controller.enqueue(block)
    }
  })).pipeTo(new WritableStream())

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
