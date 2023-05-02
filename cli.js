#!/usr/bin/env node

import { pack, cid, download } from "./index.js"

import { Command, Option } from 'commander/esm.mjs'

const program = new Command()

program
  .name('dam')
  .description('Data Archive Manager')

program.command('pack')
  .description('pack contents of a data directory into a .tar.gz content archive')
  .argument('<dir>', 'input data directory')
  .argument('<archive>', 'path to the output .tar.gz archive')
  .action(pack)

program
  .parse(process.argv)

program.help()
