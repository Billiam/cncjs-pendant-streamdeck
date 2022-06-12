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
  const sceneActions = {
    setScene: 0,
    navigate: 0,
    swapScene: 0,
    enterWcs: 1,
    enterPosition: 1,
  }
  const paletteCount = config?.ui?.palette?.length || 0

  const addButtonError = (button, path) => {
    if (buttonList.indexOf(button) !== -1) {
      return
    }
    errors.push({
      path,
      property: `instance.${path.join('.')}`,
      message: `${button} has not been defined`,
    })
  }

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

        if (Array.isArray(button)) {
          button.forEach((subButton, subColumn) => {
            const errorPath = [
              'scenes',
              scene,
              `buttons[${rowNum}][${subColumn}]`,
            ]
            addButtonError(subButton, errorPath)
          })
          return
        }

        const errorPath = ['scenes', scene, `buttons[${rowNum}]`]
        addButtonError(button, errorPath)
      })
    })
  })

  // validate scenes fit in bounds
  const rows = config.ui.rows || 3
  const columns = config.ui.columns || 5

  Object.entries(config.scenes || {}).forEach(([scene, data]) => {
    if (data?.buttons?.length > rows) {
      const errorPath = ['scenes', scene, 'buttons']
      errors.push({
        path: errorPath,
        property: `instance.${errorPath.join('.')}`,
        message: `has too many rows`,
      })
    }

    data?.buttons?.forEach((row, rowNum) => {
      if (row.length > columns) {
        const errorPath = ['scenes', scene, `buttons[${rowNum}]`]
        errors.push({
          path: errorPath,
          property: `instance.${errorPath.join('.')}`,
          message: 'has too many columns',
        })
      }
    })
  })

  // validate scenes exist
  Object.entries(config.buttons || {}).forEach(([button, data]) => {
    if (data.actions == null) {
      return
    }
    data.actions.forEach((action) => {
      if (!sceneActions[action.action]) {
        return
      }

      const position = sceneActions[action.action]
      if (
        action.arguments?.[position] != null &&
        sceneList.indexOf(action.arguments[position]) === -1
      ) {
        const errorPath = ['buttons', button, `arguments[${position}]`]
        errors.push({
          path: errorPath,
          property: `instance.${errorPath.join('.')}`,
          message: `"${action.arguments[position]}" is not a valid scene name`,
        })
      }
    })
  })

  // validate global colors exist in palette
  ;['textColor', 'bgColor', 'progressColor'].forEach((colorKey) => {
    if (typeof config.ui?.[colorKey] !== 'number') {
      return
    }
    const color = config.ui[colorKey]
    if (color < 0 || color > paletteCount) {
      const errorPath = ['ui', colorKey]
      errors.push({
        path: errorPath,
        property: `instance.${errorPath.join('.')}`,
        message: `${color} does not exist in the palette`,
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

  // find unused buttons

  // find unused scenes

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
