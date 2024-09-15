import program from 'commander'
import path from 'path'
import fs from 'fs'

program
  .version(__APP_VERSION__)
  .option('-e, --example', 'save an example config file and exit')
  .option(
    '-d, --directory <directory>',
    'path to configuration directory',
    process.cwd()
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
