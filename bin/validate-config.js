#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const validator = require('../src/configurator/lib/validator')

const configPath = process.argv[2]
if (!configPath) {
  console.error('Path to config is required')
  process.exit(1)
}
let configStr
try {
  configStr = fs.readFileSync(configPath, 'utf-8')
  path.join(__dirname, '../vue/config.schema.json')
} catch (e) {
  console.error('Unable to read config: ', configPath)
  process.exit(1)
}

const schemaStr = fs.readFileSync(
  path.join(__dirname, '../config.schema.json'),
  'utf-8'
)

let schema
let config
try {
  schema = JSON.parse(schemaStr)
} catch (e) {
  console.error('Schema is not valid JSON')
  process.exit(1)
}

try {
  config = JSON.parse(configStr)
} catch (e) {
  console.error('Config is not valid JSON')
  process.exit(1)
}

const { errors, warnings } = validator(schema, config)
warnings.forEach((warning) => {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    `${warning.path.join('.')} ${warning.message}`
  )
})
if (errors.length > 0) {
  errors.forEach((err) => {
    console.error('\x1b[31m%s\x1b[0m', `${err.path.join('.')} ${err.message}`)
  })
  process.exit(1)
} else {
  console.log('\x1b[32m%s\x1b[0m', 'Looks good!')
}
