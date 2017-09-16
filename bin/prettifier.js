#!/usr/bin/env node
const initializer = require('../initializer')
const formatter = require('../formatter')
const meow = require('meow')

const cli = meow(
  `
  Usage
	  $ prettifier [<file|glob> ...]

	Options
	  --init, -i  Sets up basic prettier configuration
   --format <input>, -f Reformat files using your prettier configuration

	Examples
	  $ prettifier --init
	  $ prettifier --format 'test/**.js src/**.js'
	  $ prettifier --format '**/**.js'
  `,
  {
    alias: {
      f: 'format'
    }
  }
)

if (cli.flags.format) {
  return formatter(cli.input)
}

if (cli.flags.init || cli.flags.init === undefined) {
  return initializer()
}
