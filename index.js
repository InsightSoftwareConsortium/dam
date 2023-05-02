import fs from 'fs'

import tar from 'tar'
import { filesFromPaths } from 'files-from-path'
import { createFileEncoderStream } from 'ipfs-car'

export async function pack(dir, archivePath) {
  if (!fs.existsSync(dir)) {
    console.error(`${dir} does not exist`)
    process.exit(1)
  }

  await tar.c({
    gzip: { level: 9 },
    file: archivePath,
  },
  [dir])

  const rootCid = await cid(archivePath)
  console.log(`CID: ${rootCid}`)

  process.exit(0)
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

export function download(urls, archivePath, cid, unpackDir) {

}