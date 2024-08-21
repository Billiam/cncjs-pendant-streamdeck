import jwt from 'jsonwebtoken'

import cliOptions from '../cli-options'

const { performance: nodePerformance } = require('perf_hooks')
const chalk = require('chalk')
const fsModule = require('fs')
const path = require('path')

const { Worker } = require('worker_threads')

const fs = fsModule.promises

const getUserHome = function () {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']
}

const getSecret = async (isGsender) => {
  try {
    const rcFile = path.resolve(
      getUserHome(),
      isGsender ? '.sender_rc' : '.cncrc'
    )
    const data = await fs.readFile(rcFile, 'utf8')
    const config = JSON.parse(data)
    return config.secret
  } catch (e) {}
}

export const fetchConfig = async () => {
  const options = getOptions()
  const configPath = path.resolve(options.directory, 'config.json')
  const data = await fs.readFile(configPath, 'utf8')
  return JSON.parse(data)
}

let options
export const getOptions = () => {
  if (options) {
    return options
  }
  options = cliOptions()
  return options
}

export const getAccessToken = async (secret, expiration, isGsender) => {
  const loadedSecret = secret ?? (await getSecret(isGsender))
  if (!loadedSecret) {
    console.error(
      chalk.red('Secret is required, see --secret command line option'),
    )
    process.exit(1)
  }
  const payload = { id: '', name: 'cncjs-pendant' }
  return jwt.sign(payload, loadedSecret, {
    expiresIn: expiration,
  })
}

export const GcodeWorker = () => {
  return new Worker(path.resolve(__dirname, 'gcode-thread-worker.js'), {
    type: 'module',
  })
}
export const OutlineWorker = () => {
  return new Worker(path.resolve(__dirname, 'outline-thread-worker.js'), {
    type: 'module',
  })
}

export const onWorkerMessage = (fn) => {
  const parentPort = require('worker_threads').parentPort
  const postMessage = parentPort.postMessage
  parentPort.on('message', (...args) => {
    fn(postMessage, ...args)
  })
}
export const onWorkerEvent = (worker, event, callback) => {
  worker.on(event, callback)
}

export const offWorkerEvent = (worker, event, callback) => {
  worker.removeListener(event, callback)
}

export const performance = nodePerformance
