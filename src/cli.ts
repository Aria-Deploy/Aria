#!/usr/bin/env node

const yargs = require("yargs/yargs");

const hideBin = () => process.argv.slice(2)
yargs(hideBin())
  // Use the commands directory to scaffold.
  .commandDir("commands")
  // Enable strict mode.
  .strict()
  // Useful aliases.
  .alias({ h: "help" }).argv;
