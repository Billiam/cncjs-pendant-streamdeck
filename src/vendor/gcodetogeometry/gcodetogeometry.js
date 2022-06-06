import util from './util.js'
import { StraightLine as StraightLine$0 } from './lines.js'
import { CurvedLine as CurvedLine$0 } from './lines.js'
import GParser from './parser.js'
var StraightLine = { StraightLine: StraightLine$0 }.StraightLine
var CurvedLine = { CurvedLine: CurvedLine$0 }.CurvedLine
/**
 * Parses the GCode into a series of lines and curves and checks if errors.
 *
 * @param {string} code - The GCode.
 * @returns {ParsedGCode} The parsed GCode.
 */
var parse = function (code) {
  'use strict'
  var unitIsSet = false
  var setInInch = true
  /**
   * Removes the comments and spaces.
   * @param  {string}  command  The command to parse
   * @return  {string}  The command without the commands and spaces.
   */
  function removeCommentsAndSpaces(command) {
    var s = command.split('(')[0].split(';')[0] //No need to use regex
    return s.split(/\s/).join('').trim()
  }
  /**
   * Parses the result of GParser.parse.
   * @param  {array}  Result of GParser.parse
   * @return  {array}  Array of object.
   */
  function parseParsedGCode(parsed) {
    var obj = {}
    var i = 0
    var letter = '',
      number = ''
    var tab = []
    var emptyObj = true
    for (i = 0; i < parsed.words.length; i++) {
      letter = parsed.words[i][0]
      number = parsed.words[i][1]
      if (letter === 'G' || letter === 'M') {
        //Make sure multiple commands in one line are interpreted as
        //multiple commands:
        if (emptyObj === false) {
          tab.push(obj)
          obj = {}
        }
        obj.type = letter + number
        emptyObj = false
      } else {
        obj[letter.toLowerCase()] = parseFloat(number, 10)
      }
    }
    tab.push(obj)
    return tab
  }
  /**
   * Checks if there is a wrong parameter.
   * @param  {array}  acceptedParameters  Array of accepted parameters (should
   *                                      not include the type of the command)
   * @param  {array}  parameters          The current given parameters
   * @return  {bool}  True if there is a wrong parameter.
   */
  function checkWrongParameter(acceptedParameters, parameters) {
    var i = 0,
      j = 0
    var accepted = true
    for (j = parameters.length - 1; j >= 0; j--) {
      for (i = acceptedParameters.length - 1; i >= 0; i--) {
        accepted = false
        if (
          parameters[j].toUpperCase() === acceptedParameters[i].toUpperCase()
        ) {
          accepted = true
          acceptedParameters.splice(i, 1)
          break
        }
      }
      if (accepted === false) {
        return true
      }
    }
    return false
  }
  /**
   * Checks and modifies the total size.
   * @param  {object}  totalSize  The the whole operation size (modified)
   * @param  {object}  size       The added operation size
   */
  function checkTotalSize(totalSize, size) {
    var keys = ['x', 'y', 'z']
    var i = 0
    for (i = keys.length - 1; i >= 0; i--) {
      if (totalSize.min[keys[i]] > size.min[keys[i]]) {
        totalSize.min[keys[i]] = size.min[keys[i]]
      }
      if (totalSize.max[keys[i]] < size.max[keys[i]]) {
        totalSize.max[keys[i]] = size.max[keys[i]]
      }
    }
  }
  /**
   * Creates an error object.
   *
   * @param {number} line The line number.
   * @param {string} message The message.
   * @param {boolean} isSkipped If the command is skipped.
   * @return {Error} The error object.
   */
  function createError(line, message, isSkipped) {
    return { line: line, message: message, isSkipped: isSkipped }
  }
  /**
   * Checks if there is an error due to the feed rate configuration.
   * @param  {object}  command    The command (the feed rate can be changed)
   * @param  {object}  errorList  The error list
   * @param  {number}  line       The line number
   * @param  {object}  settings   The modularity settings
   * @return {bool}  True if the command is skipped (error), else false if the
   *                 feedrate is correct or emits only a warning
   */
  function checkErrorFeedrate(command, errorList, line, settings) {
    var c = command
    var consideredFeedrate = c.f === undefined ? settings.feedrate : c.f
    if (
      c.type !== undefined &&
      c.type !== 'G1' &&
      c.type !== 'G2' &&
      c.type !== 'G3'
    ) {
      return false
    }
    if (consideredFeedrate > 0) {
      return false
    }
    if (consideredFeedrate < 0) {
      errorList.push(
        createError(
          line,
          '(warning) Cannot use a negative feed rate ' +
            '(the absolute value is used).',
          false
        )
      )
      c.f = Math.abs(consideredFeedrate)
      return false
    }
    errorList.push(
      createError(line, '(error) Cannot use a null feed rate (skipped).', true)
    )
    settings.feedrate = 0
    return true
  }
  /**
   * Sets the command type if not set and if a previous move command was set.
   * @param  {object}  parsedCommand        The command (is modified)
   * @param  {string}  previousMoveCommand  The type of the previous move
   *                                        command
   */
  function setGoodType(parsedCommand, previousMoveCommand) {
    if (parsedCommand.type !== undefined) {
      return
    }
    if (previousMoveCommand !== '') {
      parsedCommand.type = previousMoveCommand
    }
  }
  /**
   * Finds the next position according to the x, y and z contained or not in
   * the command parameters.
   *
   * @param {object} start The 3D start point.
   * @param {object} parameters The command parameters.
   * @param {boolean} relative If the point in the parameters is a relative
   * point.
   * @param {boolean} inMm If the values are in inches.
   * @return {object} The point.
   */
  function findPosition(start, parameters, relative, inMm) {
    var pos = { x: start.x, y: start.y, z: start.z }
    var d = inMm === false ? 1 : util.MILLIMETER_TO_INCH
    if (relative === true) {
      if (parameters.x !== undefined) {
        pos.x += parameters.x * d
      }
      if (parameters.y !== undefined) {
        pos.y += parameters.y * d
      }
      if (parameters.z !== undefined) {
        pos.z += parameters.z * d
      }
    } else {
      if (parameters.x !== undefined) {
        pos.x = parameters.x * d
      }
      if (parameters.y !== undefined) {
        pos.y = parameters.y * d
      }
      if (parameters.z !== undefined) {
        pos.z = parameters.z * d
      }
    }
    return pos
  }
  /**
   * Checks a G0 command.
   * @param  {object}  command    The command
   * @param  {array}   errorList  The error list
   * @param  {number}  line       The line number
   * @return  {bool}   Returns true if the command is done, false if skipped
   */
  function checkG0(command, errorList, line) {
    var acceptedParameters = ['X', 'Y', 'Z']
    var parameters = Object.keys(command)
    parameters.splice(parameters.indexOf('type'), 1)
    if (checkWrongParameter(acceptedParameters, parameters) === true) {
      errorList.push(
        createError(line, '(warning) Some parameters are wrong.', false)
      )
    }
    return true
  }
  /**
   * Checks a G1 command.
   * @param  {object}  command           The command
   * @param  {array}   errorList         The error list
   * @param  {number}  line              The line number
   * @param  {number}  previousFeedrate  The previous feedrate
   * @return  {bool}   Returns true if the command is done, false if skipped
   */
  function checkG1(command, errorList, line, previousFeedrate) {
    var acceptedParameters = ['X', 'Y', 'Z', 'F']
    var parameters = Object.keys(command)
    parameters.splice(parameters.indexOf('type'), 1)
    if (checkWrongParameter(acceptedParameters, parameters) === true) {
      errorList.push(
        createError(line, '(warning) Some parameters are wrong.', false)
      )
    }
    return !checkErrorFeedrate(command, errorList, line, previousFeedrate)
  }
  /**
   * Checks a G2 or G3 command.
   * @param  {object}  command           The command
   * @param  {array}   errorList         The error list
   * @param  {number}  line              The line number
   * @param  {number}  previousFeedrate  The previous feedrate
   * @return  {bool}   Returns true if the command is done, false if skipped
   */
  function checkG2G3(command, errorList, line, previousFeedrate) {
    var acceptedParameters = ['X', 'Y', 'Z', 'F', 'I', 'J', 'K', 'R']
    var parameters = Object.keys(command)
    parameters.splice(parameters.indexOf('type'), 1)
    if (checkWrongParameter(acceptedParameters, parameters) === true) {
      errorList.push(
        createError(line, '(warning) Some parameters are wrong.', false)
      )
    }
    if (
      command.r === undefined &&
      command.i === undefined &&
      command.j === undefined &&
      command.k === undefined
    ) {
      errorList.push(
        createError(line, '(error) No parameter R, I, J or K.', true)
      )
      return false
    }
    if (
      command.r !== undefined &&
      (command.i !== undefined ||
        command.j !== undefined ||
        command.k !== undefined)
    ) {
      errorList.push(
        createError(
          line,
          '(error) Cannot use R and I, J or K at the same time.',
          true
        )
      )
      return false
    }
    return !checkErrorFeedrate(command, errorList, line, previousFeedrate)
  }
  /**
   * Manages a 60 or G1 command.
   * @param  {object}  command    The command
   * @param  {object}  settings   The modularity settings
   * @param  {object}  totalSize  The the whole operation size (modified)
   * @param  {array}   lines      The array containing the lines
   * @param  {number}  lineNumber The line number
   * @param  {object}  errorList  The error list
   */
  function manageG0G1(command, settings, lineNumber, lines, totalSize) {
    var nextPosition = findPosition(
      settings.position,
      command,
      settings.relative,
      settings.inMm
    )
    var line = new StraightLine(
      lineNumber,
      settings.position,
      nextPosition,
      command,
      settings
    )
    settings.previousMoveCommand = command.type
    checkTotalSize(totalSize, line.getSize())
    lines.push(line.returnLine())
    settings.position = util.copyObject(line.end)
    if (command.f !== undefined) {
      settings.feedrate = command.f
    }
  }
  /**
   * Manages a G2 or G3 command.
   * @param  {object}  command    The command
   * @param  {object}  settings   The modularity settings
   * @param  {number}  lineNumber The line number
   * @param  {array}   lines      The array containing the lines
   * @param  {object}  totalSize  The the whole operation size (modified)
   * @param  {object}  errorList  The error list
   */
  function manageG2G3(
    command,
    settings,
    lineNumber,
    lines,
    totalSize,
    errorList
  ) {
    var nextPosition = findPosition(
      settings.position,
      command,
      settings.relative,
      settings.inMm
    )
    var line = new CurvedLine(
      lineNumber,
      settings.position,
      nextPosition,
      command,
      settings
    )
    if (line.center !== false) {
      var temp = line.returnLine()
      if (temp === false) {
        errorList.push(
          createError(lineNumber, '(error) Impossible to create arc.', true)
        )
        return
      }
      settings.feedrate = line.feedrate
      settings.previousMoveCommand = command.type
      checkTotalSize(totalSize, line.getSize())
      lines.push(temp)
      settings.position = util.copyObject(line.end)
    } else {
      errorList.push(
        createError(
          lineNumber,
          '(error) Physically impossible to do with those values.',
          true
        )
      )
    }
  }
  /**
   * Manages a command (check it, create geometrical line, change setting...).
   * @param  {object}  command    The command
   * @param  {object}  settings   The modularity settings
   * @param  {number}  lineNumber The line number
   * @param  {array}   lines      The array containing the lines
   * @param  {object}  totalSize  The the whole operation size (modified)
   * @param  {object}  errorList  The error list
   * @return {bool}  Returns true if have to continue, else false
   */
  function manageCommand(
    command,
    settings,
    lineNumber,
    lines,
    totalSize,
    errorList
  ) {
    //Empty line
    if (command.type === undefined && Object.keys(command).length === 0) {
      return true
    }
    setGoodType(command, settings.previousMoveCommand)
    if (command.type === undefined) {
      if (command.f !== undefined) {
        checkErrorFeedrate(command, errorList, lineNumber, settings.feedrate)
        settings.feedrate = command.f
      }
    } else if (
      command.type === 'G0' &&
      checkG0(command, errorList, lineNumber) === true
    ) {
      manageG0G1(command, settings, lineNumber, lines, totalSize)
    } else if (
      command.type === 'G1' &&
      checkG1(command, errorList, lineNumber, settings) === true
    ) {
      manageG0G1(command, settings, lineNumber, lines, totalSize)
    } else if (
      (command.type === 'G2' || command.type === 'G3') &&
      checkG2G3(command, errorList, lineNumber, settings) === true
    ) {
      manageG2G3(command, settings, lineNumber, lines, totalSize, errorList)
    } else if (command.type === 'G17') {
      settings.crossAxe = 'z'
    } else if (command.type === 'G18') {
      settings.crossAxe = 'y'
    } else if (command.type === 'G19') {
      settings.crossAxe = 'x'
    } else if (command.type === 'G20') {
      settings.inMm = false
      if (unitIsSet === false) {
        setInInch = true
        unitIsSet = true
      }
    } else if (command.type === 'G21') {
      settings.inMm = true
      if (unitIsSet === false) {
        setInInch = false
        unitIsSet = true
      }
    } else if (command.type === 'G90') {
      settings.relative = false
    } else if (command.type === 'G91') {
      settings.relative = true
    } else if (command.type === 'M2') {
      return false
    }
    return true
  }
  var totalSize = {
    min: { x: 0, y: 0, z: 0 },
    max: { x: 0, y: 0, z: 0 },
  }
  var i = 0,
    j = 0
  var tabRes = []
  var parsing = true
  var lines = []
  var errorList = []
  var settings = {
    feedrate: 0,
    previousMoveCommand: '',
    crossAxe: 'z',
    inMm: false,
    relative: false,
    position: { x: 0, y: 0, z: 0 },
  }
  if (typeof code !== 'string' || code === '') {
    return {
      gcode: [],
      lines: [],
      size: totalSize,
      displayInInch: setInInch,
      errorList: [{ line: 0, message: '(error) No command.' }],
    }
  }
  var gcode = code.split('\n')
  i = 0
  while (i < gcode.length && parsing === true) {
    //Sorry for not being really readable :'(
    tabRes = parseParsedGCode(
      GParser.parse(removeCommentsAndSpaces(gcode[i]).toUpperCase())
    )
    j = 0
    while (j < tabRes.length && parsing === true) {
      parsing = manageCommand(
        tabRes[j],
        settings,
        i + 1,
        lines,
        totalSize,
        errorList
      )
      j++
    }
    i++
  }
  if (i < gcode.length) {
    errorList.push(
      createError(i + 1, '(warning) The next code is not executed.', false)
    )
  }
  return {
    gcode: gcode,
    lines: lines,
    size: totalSize,
    displayInInch: setInInch,
    errorList: errorList,
  }
}
export { parse }
