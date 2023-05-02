import fs from 'fs'
import tar from 'tar'

export function pack(dir, archivePath) {
  console.log(dir, archivePath)
  if (!fs.existsSync(dir)) {
    console.error(`${dir} does not exist`)
    process.exit(1)
  }

  tar.c({
    gzip: { level: 9 },
    file: archivePath,
  },
  [dir])

  process.exit(0)
}

export function cid(archivePath) {

}

export function download(urls, archivePath, cid, unpackDir) {

}