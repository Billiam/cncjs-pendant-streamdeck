import { token, Compiler } from 'simple-evaluate'

const splitText = (text) => text.split(/(?={{(?:.*?)}})|(?<={{(?:.*?)}})/g)

export default (text) => {
  const builder = splitText(text).map((component) => {
    if (/{{(.*?)}}/.test(component)) {
      const tokenList = token(component.replace(/{{(.*)}}/, '$1'))
      const compiler = new Compiler(tokenList)
      const ast = compiler.parse()
      return (context) => compiler.calc(ast, context)
    } else {
      return () => component
    }
  })
  return (context) => builder.reduce((str, method) => str + method(context), '')
}
