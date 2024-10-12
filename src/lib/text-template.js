import { Compiler, token } from 'simple-evaluate'

const splitText = (text) => text.split(/(?={{(?:.*?)}})|(?<={{(?:.*?)}})/g)

export default (text) => {
  const builder = splitText(text).map((component) => {
    try {
      if (/{{(.*?)}}/.test(component)) {
        const tokenList = token(component.replace(/{{(.*)}}/, '$1'))
        const compiler = new Compiler(tokenList)
        const ast = compiler.parse()
        return (context) => {
          try {
            return compiler.calc(ast, context)
          } catch (e) {
            return e.message
          }
        }
      } else {
        return () => component
      }
    } catch (e) {
      return () => e.message
    }
  })
  return (context) => builder.reduce((str, method) => str + method(context), '')
}
