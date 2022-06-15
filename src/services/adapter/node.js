import jwt from 'jsonwebtoken'
import chalk from 'chalk'
const fsModule = require('fs')
const path = require('path')
const fs = fsModule.promises

const getUserHome = function () {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']
}

const getSecret = async (secret) => {
  if (secret) {
    return secret
  }
  try {
    const cncrc = path.resolve(getUserHome(), '.cncrc')
    const data = await fs.readFile(cncrc, 'utf8')
    const config = JSON.parse(data)
    return config.secret
  } catch (e) {}
}

export default {
  fetchConfig: async () => {
    const data = await fs.readFile('src/public/config.json', 'utf8')
    return JSON.parse(data)
  },

  getAccessToken: async (secret, expiration) => {
    secret = await getSecret(secret)
    if (!secret) {
      console.error(
        chalk.red('Secret is required, see --secret command line option')
      )
      process.exit(1)
    }
    const payload = { id: '', name: 'cncjs-pendant' }
    return jwt.sign(payload, secret, {
      expiresIn: expiration,
    })
  },
}
