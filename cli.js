#!/usr/bin/env node

import { pack, cid, download } from "./index.js"

import { Command } from 'commander/esm.mjs'

async function packDirectory(dir, archivePath) {
  await pack(dir, archivePath)

  const rootCid = await cid(archivePath)
  console.log(`CID: ${rootCid}`)

  process.exit(0)
}

async function printCid(archivePath) {
  const rootCid = await cid(archivePath)
  console.log(`CID: ${rootCid}`)

  process.exit(0)
}

export async function downloadData(dir, archivePath, cid, urls, options) {
  await download(dir, archivePath, cid, urls, options)

  process.exit(0)
}

const program = new Command()

program
  .name('dam')
  .description('Data Archive Manager')

program.command('pack')
  .description('pack contents of a data directory into a .tar.gz content archive')
  .argument('<dir>', 'input data directory')
  .argument('<archive>', 'path to the output .tar.gz archive')
  .action(packDirectory)

program.command('cid')
  .description('compute the content identifier (CID) for the .tar.gz content archive')
  .argument('<archive>', 'path to the .tar.gz archive')
  .action(printCid)

program.command('download')
  .description('verify local archive with provided cid or download and unpack if not present')
  .argument('<dir>', 'output data directory')
  .argument('<archive>', 'path to the local .tar.gz archive')
  .argument('<cid>', 'expected cid')
  .argument('<urls...>', 'one or more urls storing the archive')
  .option('-r, --retries <retries>', 'download retries', parseInt)
  .option('-v, --verbose', 'print status')
  .action(downloadData)

await program
  .parseAsync(process.argv)

program.help()
