import bus from '@/lib/bus'
import CncActions from '@/lib/cnc-actions'
import CncApi from '@/lib/cnc-api'
import Connection from '@/lib/connection'
import StateFeeder from '@/lib/state-feeder'
import ButtonActions from '@/services/button-actions'
import MethodProvider from '@/lib/cation/method-provider'
import { fetchConfig, getAccessToken, getOptions } from 'adapter'
import Cation from 'cation/dist/cation'

export default () => {
  const container = new Cation()
  container.addProvider('method', MethodProvider)
  container.register('config', fetchConfig, {
    type: 'method',
    singleton: true,
  })
  container.register('accessToken', getAccessToken, {
    args: ['@secret', '@expiration'],
    type: 'method',
    singleton: true,
  })
  container.register('options', getOptions, {
    type: 'method',
  })
  container.register('secret', (config) => config.secret, {
    args: ['@connectionConfig'],
    type: 'method',
  })
  container.register(
    'expiration',
    (config) => config.accessTokenExpiration ?? '30d',
    {
      args: ['@connectionConfig'],
      type: 'method',
    }
  )
  container.register('port', (config) => config.port, {
    args: ['@connectionConfig'],
    type: 'method',
  })
  container.register('socketAddress', (config) => config.socketAddress, {
    args: ['@connectionConfig'],
    type: 'method',
  })
  container.register('socketPort', (config) => config.socketPort, {
    args: ['@connectionConfig'],
    type: 'method',
  })
  container.register('secure', (config) => config.secure, {
    args: ['@connectionConfig'],
    type: 'method',
  })
  container.register('machineConfig', (config) => config.machine, {
    args: ['@config'],
    type: 'method',
  })
  container.register('cncApi', CncApi, {
    args: ['@accessToken', '@socketAddress', '@socketPort', '@secure'],
    type: 'method',
  })
  container.register('ackBus', bus(), { type: 'static' })
  container.register('actionBus', bus(), { type: 'static' })
  container.register('connectionBus', bus(), { type: 'static' })

  container.register(
    'connectionConfig',
    (config, options) => {
      return {
        ...(config.cncjs || {}),
        ...(options || {}),
      }
    },
    { args: ['@config', '@options'], type: 'method', singleton: true }
  )
  container.register(
    'socket',
    async (connection) => {
      const { socket } = await connection.connect()
      return socket
    },
    {
      args: ['@connection'],
      type: 'method',
      singleton: true,
    }
  )
  container.register('cncjsConfig', (config) => config.cncjs, {
    args: ['@config'],
    type: 'method',
  })
  container.register('connection', Connection, {
    args: ['@connectionConfig', '@accessToken'],
    singleton: true,
  })
  container.register('stateFeeder', StateFeeder, {
    args: ['@socket', '@ackBus'],
    type: 'method',
    singleton: true,
  })
  container.register('cncActions', CncActions, {
    args: ['@socket', '@port', '@machineConfig', '@actionBus', '@ackBus'],
    type: 'method',
    singleton: true,
  })
  container.register('buttonActions', ButtonActions, {
    args: ['@actionBus', '@connectionBus'],
    type: 'method',
    singleton: true,
  })

  return container
}
