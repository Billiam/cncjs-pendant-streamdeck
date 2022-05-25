#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

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

const Validator = require('jsonschema').Validator
const v = new Validator()
const result = v.validate(config, schema)

const logicValidation = (config) => {
  if (!config) {
    return
  }

  const buttonList = Object.keys(config.buttons || {})
  const sceneList = Object.keys(config.scenes || {})
  const errors = []
  const sceneActions = ['setScene', 'navigate', 'swapScene']
  const paletteCount = config?.ui?.palette?.length || 0

  // validate buttons exist
  Object.entries(config.scenes || {}).forEach(([scene, data]) => {
    data?.buttons?.forEach((row, rowNum) => {
      row.forEach((button) => {
        if (
          button == null ||
          button === '' ||
          buttonList.indexOf(button) !== -1
        ) {
          return
        }
        const errorPath = ['scenes', scene, `buttons[${rowNum}]`]
        errors.push({
          path: errorPath,
          property: `instance.${errorPath.join('.')}`,
          message: `${button} has not been defined`,
        })
      })
    })
  })

  // validate scenes exist
  Object.entries(config.buttons || {}).forEach(([button, data]) => {
    if (data.action == null || sceneActions.indexOf(data.action) === -1) {
      return
    }
    if (data.arguments != null && sceneList.indexOf(data.arguments[0]) === -1) {
      const errorPath = ['buttons', button, 'arguments[0]']
      errors.push({
        path: errorPath,
        property: `instance.${errorPath.join('.')}`,
        message: `${action} ${arguments[0]} is not a valid scene name`,
      })
    }
  })

  // validate colors exist in palette
  Object.entries(config.buttons || {}).forEach(([button, data]) => {
    if (typeof data.bgColor !== 'number') {
      return
    }

    if (data.bgColor < 0 || data.bgColor > paletteCount) {
      const errorPath = ['buttons', button, 'bgColor']
      errors.push({
        path: errorPath,
        property: `instance.${errorPath.join('.')}`,
        message: `${data.bgColor} does not exist in the palette`,
      })
    }
  })

  // validate scene targets
  return errors
}

const logicErrors = logicValidation(config)
const allErrors = result.errors.concat(logicErrors)

if (allErrors.length > 0) {
  allErrors.forEach((err) => {
    console.error(`${err.path.join('.')} ${err.message}`)
  })
  process.exit(1)
} else {
  console.log('Looks good!')
}
