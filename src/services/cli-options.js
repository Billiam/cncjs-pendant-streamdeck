import program from 'commander'
import fs from 'fs'
import path from 'path'

program
  .version(__APP_VERSION__)
  .option('-e, --example', 'save an example config file and exit')
  .usage('-s <secret> -p <port> [options]')
  .option('-s, --secret <secret>', 'the secret key stored in the ~/.cncrc file')
  .option('-p, --port <port>', 'path or name of serial port')
  .option('-b, --baudrate <baudrate>', 'baud rate (default: 115200)', 115200)
  .option(
    '-d, --directory <directory>',
    'path to configuration directory',
    process.cwd()
  )
  .option(
    '--socket-address <address>',
    'socket address or hostname (default: localhost)',
    'localhost'
  )
  .option('--socket-port <port>', 'socket port (default: 8000)', 8000)
  .option(
    '--controller-type <type>',
    'controller type: Grbl|Smoothie|TinyG (default: Grbl)',
    'Grbl'
  )
  .option(
    '--access-token-lifetime <lifetime>',
    'access token lifetime in seconds or a time span string (default: 30d)',
    '30d'
  )

export default () => {
  program.parse()
  const options = program.opts()
  if (options.example) {
    fs.copyFileSync(
      path.join(__dirname, 'config.example.json'),
      'config.example.json'
    )
    console.log(`${process.cwd()}/config.example.json saved`)
    process.exit()
  }
  return options
}
