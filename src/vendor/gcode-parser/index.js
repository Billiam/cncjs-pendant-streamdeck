/* eslint no-bitwise: 0 */
/* eslint no-continue: 0 */

// @param {string} line The G-code line
const parseLine = (() => {
  // http://linuxcnc.org/docs/html/gcode/overview.html#gcode:comments
  const re =
    /(%.*)|({.*)|((?:\$\$)|(?:\$[a-zA-Z0-9#]*))|([a-zA-Z][0-9\+\-\.]+)|(\*[0-9]+)/gim

  return (line, options) => {
    const result = {
      line: line,
      words: [],
    }
    let ln // Line number
    const words = line.match(re) || []

    for (let i = 0, l = words.length; i < l; ++i) {
      const word = words[i]
      const letter = word[0]
      const argument = word.slice(1)

      // Parse % commands for bCNC and CNCjs
      // - %wait Wait until the planner queue is empty
      if (letter === '%') {
        result.cmds = (result.cmds || []).concat(line.trim())
        continue
      }

      // Parse JSON commands for TinyG and g2core
      if (letter === '{') {
        result.cmds = (result.cmds || []).concat(line.trim())
        continue
      }

      // Parse $ commands for Grbl
      // - $C Check gcode mode
      // - $H Run homing cycle
      if (letter === '$') {
        result.cmds = (result.cmds || []).concat(`${letter}${argument}`)
        continue
      }

      // N: Line number
      if (letter === 'N' && typeof ln === 'undefined') {
        // Line (block) number in program
        ln = Number(argument)
        continue
      }

      let value = Number(argument)
      if (Number.isNaN(value)) {
        value = argument
      }

      result.words.push([letter, value])
    }

    // Line number
    typeof ln !== 'undefined' && (result.ln = ln)

    return result
  }
})()

const parseStringSync = (str, options) => {
  const { flatten = false, noParseLine = false } = { ...options }
  const results = []
  const lines = str.split('\n')

  for (let i = 0, l = lines.length; i < l; ++i) {
    const line = lines[i].trim()
    if (line.length === 0) {
      continue
    }
    const result = parseLine(line, {
      flatten,
      noParseLine,
    })
    results.push(result)
  }

  return results
}

export { parseLine, parseStringSync }
