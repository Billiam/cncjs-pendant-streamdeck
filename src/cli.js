import Container from '@/services/container'
import Bootstrap from '@/services/bootstrap'
import { createPinia } from 'pinia'

const container = Container()
container.register('pinia', createPinia, { type: 'method', singleton: true })

const bootstrap = Bootstrap(container)

bootstrap.start()

// TODO: add ssr var to visibility
