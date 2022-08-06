export class ConnectionError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConnectionError'
  }
}
