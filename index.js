#!/usr/bin/env node

require = require('esm')(module);
require('./src/quickcheck').cli(process.argv);