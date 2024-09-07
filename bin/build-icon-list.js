#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const iconDirectory = path.resolve(__dirname, '../src/public/icons')

const files = fs.readdirSync(iconDirectory).filter(directory => {
  return directory !== 'custom' && fs.lstatSync(path.join(iconDirectory, directory)).isDirectory()
}).reduce((result, directory) => {
  const icons = fs.readdirSync(path.join(iconDirectory, directory)).filter(icon => icon.endsWith('.png'))

  result[directory] = icons

  return result
}, {})

fs.writeFileSync(path.resolve(__dirname, '../src/lib/iconlist.json'), JSON.stringify(files, null, 2))
