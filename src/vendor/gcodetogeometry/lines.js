import util from './util.js'

/**
 * This file contains the classes managing the lines. The lines are
 * the representation of the G0, G1, G2 and G3 commands.
 */
/**
 * Creates an instance of the StraightLine class. This class does the
 * computations for the G0 and G1 commands.
 *
 * @class
 * @param {number} index - The line number where this command appears.
 * @param {Point} start - The 3D start point.
 * @param {ParsedCommand} parsedCommand - The parsed command.
 * @param {Settings} settings - The modularity settings.
 * @return {StraightLine} An instance of the StraightLine class.
 */
var StraightLine = function (index, start, end, parsedCommand, settings) {
  'use strict'
  var that = this
  /**
   * Returns a line object of type "G0" or "G1" (corresponding to
   * parsedCommand).
   *
   * @function returnLine
   * @memberof util.StraightLine
   * @instance
   * @return {Line} The line object.
   */
  that.returnLine = function () {
    return {
      lineNumber: that.index,
      type: that.word,
      start: that.start,
      end: that.end,
      feedrate: that.feedrate,
    }
  }
  /**
   * Returns the size of the line.
   *
   * @function getSize
   * @memberof util.StraightLine
   * @instance
   * @return {Size} The size.
   */
  that.getSize = function () {
    return {
      min: {
        x: Math.min(that.start.x, that.end.x),
        y: Math.min(that.start.y, that.end.y),
        z: Math.min(that.start.z, that.end.z),
      },
      max: {
        x: Math.max(that.start.x, that.end.x),
        y: Math.max(that.start.y, that.end.y),
        z: Math.max(that.start.z, that.end.z),
      },
    }
  }
  function initialize(index, start, parsedCommand, settings) {
    that.index = index
    that.word = parsedCommand.type
    that.start = { x: start.x, y: start.y, z: start.z }
    that.end = end
    if (parsedCommand.type === 'G0') {
      that.feedrate = 0
    } else if (parsedCommand.f === undefined) {
      that.feedrate = settings.feedrate
    } else {
      that.feedrate = util.calculateFeedrate(parsedCommand.f, settings.inMm)
    }
  }
  initialize(index, start, parsedCommand, settings)
}
/**
 * Creates an instance of the CurvedLine class. This class does the computations
 * for the G2 and G3 commands.
 *
 * @class
 * @param {number} index - The line number where this command appears.
 * @param {Point} start - The 3D start point.
 * @param {ParsedCommand} parsedCommand - The parsed command.
 * @param {Settings} settings - The modularity settings.
 * @return {CurvedLine} An instance of the CurvedLine class.
 */
var CurvedLine = function (index, start, end, parsedCommand, settings) {
  'use strict'
  var that = this
  // Will give 0 if start and end are the same
  function getBezierAngle() {
    var axes = util.findAxes(that.crossAxe)
    var cs = {
      x: that.start[axes.re] - that.center[axes.re],
      y: that.start[axes.im] - that.center[axes.im],
      z: 0,
    }
    var ce = {
      x: that.end[axes.re] - that.center[axes.re],
      y: that.end[axes.im] - that.center[axes.im],
      z: 0,
    }
    return util.findAngleOrientedVectors2(cs, ce, that.clockwise === false)
  }
  function getBezierRadius() {
    var axes = util.findAxes(that.crossAxe)
    var cs = {
      x: that.start[axes.re] - that.center[axes.re],
      y: that.start[axes.im] - that.center[axes.im],
      z: 0,
    }
    return util.lengthVector3(cs)
  }
  //Simple cubic Bézier curve interpolation clockwise on XY plane
  //angle in radian included in [0; pi/2]
  //radius > 0
  //From Richard A DeVeneza's work
  function cubBez2DInt(angle, radius) {
    var p0 = {},
      p1 = {},
      p2 = {},
      p3 = {}
    angle = Math.abs(angle)
    if (angle === Math.PI / 2) {
      //cos(PI/4) == sin(PI/4) but JavaScript doesn't believe it
      p0 = { x: 0.707106781186548, y: 0.707106781186548, z: 0 }
      p1 = { x: 1.097631072937817, y: 0.316582489435277, z: 0 }
    } else {
      p0 = { x: Math.cos(angle / 2), y: Math.sin(angle / 2), z: 0 }
      p1 = {
        x: (4 - p0.x) / 3,
        y: ((1 - p0.x) * (3 - p0.x)) / (3 * p0.y),
        z: 0,
      }
    }
    p0.x *= radius
    p0.y *= radius
    p1.x *= radius
    p1.y *= radius
    p2 = { x: p1.x, y: -p1.y, z: 0 }
    p3 = { x: p0.x, y: -p0.y, z: 0 }
    return { p0: p0, p1: p1, p2: p2, p3: p3 }
  }
  //Transform a 2D cubic Bézier's curve clockwise on XY plane
  // to a Bézier's curve in 3D with the right crossAxe and clock direction
  // clockwise is bool
  // pitch can be positive or negative
  function cubBez2DTo3D(curve, clockwise, pitch, crossAxe) {
    var height = 0 //height position for p1, p2 and p3
    if (clockwise === false) {
      util.swapObjects(curve.p0, curve.p3)
      util.swapObjects(curve.p1, curve.p2)
    }
    //NOTE: maybe this is better:
    // b = p*alpha*(r - ax)*(3*r -ax)/(ay*(4*r - ax)*Math.tan(alpha))
    //Set the good cross axe and transform into a helical Bézier curve
    height = pitch / 3
    if (crossAxe.toLowerCase() === 'z') {
      curve.p0.z = 0
      curve.p1.z = height
      curve.p2.z = height * 2
      curve.p3.z = height * 3
    } else if (crossAxe.toLowerCase() === 'x') {
      curve.p0.z = curve.p0.y
      curve.p0.y = curve.p0.x
      curve.p0.x = 0
      curve.p1.z = curve.p1.y
      curve.p1.y = curve.p1.x
      curve.p1.x = height
      curve.p2.z = curve.p2.y
      curve.p2.y = curve.p2.x
      curve.p2.x = height * 2
      curve.p3.z = curve.p3.y
      curve.p3.y = curve.p3.x
      curve.p3.x = height * 3
    } else if (crossAxe.toLowerCase() === 'y') {
      curve.p0.z = curve.p0.x
      curve.p0.x = curve.p0.y
      curve.p0.y = 0
      curve.p1.z = curve.p1.x
      curve.p1.x = curve.p1.y
      curve.p1.y = height
      curve.p2.z = curve.p2.x
      curve.p2.x = curve.p2.y
      curve.p2.y = height * 2
      curve.p3.z = curve.p3.x
      curve.p3.x = curve.p3.y
      curve.p3.y = height * 3
    }
    return curve
  }
  function rotAndPlaBez(curve, center, angle, re, im) {
    var c = { x: 0, y: 0, z: 0 }
    util.scaleAndRotation(c, curve.p0, curve.p0, angle, 1, re, im)
    util.scaleAndRotation(c, curve.p1, curve.p1, angle, 1, re, im)
    util.scaleAndRotation(c, curve.p2, curve.p2, angle, 1, re, im)
    util.scaleAndRotation(c, curve.p3, curve.p3, angle, 1, re, im)
    util.movePoint(curve.p0, center)
    util.movePoint(curve.p1, center)
    util.movePoint(curve.p2, center)
    util.movePoint(curve.p3, center)
  }
  // The Bézier's curve must be on the good plane
  function getFullBezier(num90, bez90, numSmall, bezSmall, pitch90) {
    var arcs = []
    var center = util.copyObject(that.center)
    var axes = util.findAxes(that.crossAxe)
    var cs = {
      x: that.start[axes.re] - center[axes.re],
      y: that.start[axes.im] - center[axes.im],
    }
    var i = 0,
      angle = 0,
      sign = that.clockwise === true ? -1 : 1
    if (num90 === 0 && numSmall === 0) {
      return arcs
    }
    if (num90 > 0) {
      angle = util.findAngleOrientedVectors2(
        { x: bez90.p0[axes.re], y: bez90.p0[axes.im] },
        cs,
        that.clockwise === false,
      )
      for (i = 0; i < num90; i++) {
        arcs.push(util.copyObject(bez90))
        rotAndPlaBez(arcs[i], center, angle, axes.re, axes.im)
        // angle += Math.PI / 2 * sign;
        angle += 1.570796326794897 * sign
        center[that.crossAxe] += pitch90
      }
    }
    if (numSmall > 0) {
      angle = util.findAngleOrientedVectors2(
        { x: bezSmall.p0[axes.re], y: bezSmall.p0[axes.im] },
        cs,
        that.clockwise === false,
      )
      if (num90 !== 0) {
        angle += num90 * 1.570796326794897 * sign
      }
      arcs.push(util.copyObject(bezSmall))
      rotAndPlaBez(arcs[i], center, angle, axes.re, axes.im)
    }
    //To be sure the first point is at the start
    arcs[0].p0.x = that.start.x
    arcs[0].p0.y = that.start.y
    arcs[0].p0.z = that.start.z
    //To be sure the last point is at the end
    arcs[arcs.length - 1].p3.x = that.end.x
    arcs[arcs.length - 1].p3.y = that.end.y
    arcs[arcs.length - 1].p3.z = that.end.z
    return arcs
  }
  function arcToBezier() {
    var num90 = 0,
      numSmall = 1 //Number arc = pi/2 and arc < pi/2
    var bez90 = {},
      bezSmall = {}
    var p90 = 0,
      pLittle = 0,
      pAngle = 0 //Pitch of the arcs
    var angle = getBezierAngle()
    var radius = getBezierRadius()
    var absAngle = Math.abs(angle),
      halfPI = 1.570796326794897
    if (angle === 0 || radius === 0) {
      return []
    }
    //Find number of diferent sections
    if (absAngle > halfPI) {
      //Untrustful (as this language) function, should be tested:
      num90 = parseInt(absAngle / halfPI, 10)
      numSmall = absAngle % halfPI !== 0 ? 1 : 0
    }
    //Find pitches
    pAngle = (that.end[that.crossAxe] - that.start[that.crossAxe]) / absAngle
    p90 = halfPI * pAngle
    pLittle = (absAngle - num90 * halfPI) * pAngle
    //Find helical Bézier's curves
    if (num90 > 0) {
      bez90 = cubBez2DInt(halfPI, radius)
      cubBez2DTo3D(bez90, angle < 0, p90, that.crossAxe)
    }
    if (numSmall > 0) {
      angle = absAngle - num90 * halfPI
      if (that.clockwise === true) {
        angle = -angle
      }
      bezSmall = cubBez2DInt(angle, radius)
      cubBez2DTo3D(bezSmall, angle < 0, pLittle, that.crossAxe)
    }
    return getFullBezier(num90, bez90, numSmall, bezSmall, p90)
  }
  //Cannot use arcToBezier because of calculus of oriented angle
  function circleToBezier() {
    var bez90 = {}
    var bezier = []
    var pitch = 0
    var halfPI = 1.570796326794897
    var sign = that.clockwise === true ? -1 : 1
    var rotAngle = sign * Math.PI * 2
    var radius = getBezierRadius()
    var i = 0
    var center = util.copyObject(that.center)
    var axes = util.findAxes(that.crossAxe)
    if (radius === 0) {
      return []
    }
    //We cannot just make a full circle without caring of the start and
    //end point. Therefore, we need to use the rotation
    pitch = (that.end[that.crossAxe] - that.start[that.crossAxe]) / 4
    bez90 = cubBez2DInt(halfPI, radius)
    cubBez2DTo3D(bez90, that.clockwise, pitch, that.crossAxe)
    for (i = 0; i < 4; i++) {
      bezier.push(util.copyObject(bez90))
      rotAndPlaBez(bezier[i], center, rotAngle, axes.re, axes.im)
      rotAngle += halfPI * sign
      center[that.crossAxe] += pitch
    }
    return getFullBezier(4, bez90, 0, bez90, pitch)
  }
  /**
   * Returns a line object of type "G2" or "G3" (corresponding to
   * parsedCommand).
   *
   * @function returnLine
   * @memberof util.CurvedLine
   * @instance
   * @return {Line|boolean} False if impossible line else the line object.
   */
  that.returnLine = function () {
    var bez = []
    var axes = util.findAxes(that.crossAxe)
    if (
      that.start[axes.re] === that.end[axes.re] &&
      that.start[axes.im] === that.end[axes.im]
    ) {
      bez = circleToBezier()
    } else {
      bez = arcToBezier()
    }
    if (bez.length === 0) {
      return false
    }
    return {
      lineNumber: that.index,
      type: that.word,
      beziers: bez,
      feedrate: that.feedrate,
    }
  }
  /**
   * Finds the center of the arc. Returns false if impossible.
   *
   * @param {Point} start The starting point of the arc.
   * @param {Point} end The ending point of the arc.
   * @param {boolean} clockwise If the arc goes clockwise.
   * @param {string} crossAxe The name of the axe given by the cross product
   * of the vectors defining the plane.
   * @return {object|boolean} The center point or false.
   */
  function findCenterWithRadius(start, end, radius, clockwise, crossAxe) {
    var se = { x: end.x - start.x, y: end.y - start.y, z: end.z - start.z }
    var angle = 0,
      l = 1,
      lSE = 0,
      r = Math.abs(radius),
      aCSCE = 0
    var center = { x: 0, y: 0, z: 0 }
    var axes = util.findAxes(crossAxe)
    lSE = Math.sqrt(se[axes.re] * se[axes.re] + se[axes.im] * se[axes.im])
    if (lSE > Math.abs(radius * 2) || lSE === 0) {
      return false
    }
    angle = Math.acos(lSE / (2 * r))
    l = r / lSE
    util.scaleAndRotation(start, end, center, angle, l, axes.re, axes.im)
    aCSCE = util.findAngleVectors2(
      {
        x: start[axes.re] - center[axes.re],
        y: start[axes.im] - center[axes.im],
      },
      { x: end[axes.re] - center[axes.re], y: end[axes.im] - center[axes.im] },
    )
    if (clockwise === true) {
      if (radius > 0 && -Math.PI <= aCSCE && aCSCE <= 0) {
        return center
      }
      if (radius < 0 && 0 <= aCSCE && aCSCE <= Math.PI) {
        return center
      }
    } else {
      if (radius > 0 && 0 <= aCSCE && aCSCE <= Math.PI) {
        return center
      }
      if (radius < 0 && -Math.PI <= aCSCE && aCSCE <= 0) {
        return center
      }
    }
    util.scaleAndRotation(start, end, center, -angle, l, axes.re, axes.im)
    return center
  }
  //radius is positive or negative
  function findCenter(start, end, parsedCommand, clockwise, crossAxe, inMm) {
    var delta = inMm === false ? 1 : util.MILLIMETER_TO_INCH
    var zeroPrecision = inMm ? 0.00001 : util.FLOAT_PRECISION
    var comparePrecision = inMm ? 0.0001 : util.FLOAT_PRECISION
    var center = { x: start.x, y: start.y, z: start.z }
    var distCenterStart, distCenterEnd
    var axes = util.findAxes(crossAxe)
    if (parsedCommand.r === undefined) {
      if (parsedCommand.i !== undefined) {
        center.x += parsedCommand.i * delta
      }
      if (parsedCommand.j !== undefined) {
        center.y += parsedCommand.j * delta
      }
      if (parsedCommand.k !== undefined) {
        center.z += parsedCommand.k * delta
      }
      //Check if not impossible
      distCenterStart = Math.pow(center[axes.re] - start[axes.re], 2)
      distCenterStart += Math.pow(center[axes.im] - start[axes.im], 2)
      distCenterEnd = Math.pow(center[axes.re] - end[axes.re], 2)
      distCenterEnd += Math.pow(center[axes.im] - end[axes.im], 2)
      if (
        util.nearlyEqual(distCenterStart, 0, zeroPrecision) === true ||
        util.nearlyEqual(distCenterEnd, 0, zeroPrecision) === true
      ) {
        return false
      }
      if (
        util.nearlyEqual(distCenterStart, distCenterEnd, comparePrecision) ===
        false
      ) {
        return false
      }
    } else {
      center = findCenterWithRadius(
        start,
        end,
        parsedCommand.r * delta,
        clockwise,
        crossAxe,
      )
      if (center === false) {
        return false
      }
    }
    center[crossAxe] = start[crossAxe]
    return center
  }
  function axeCutArc(reValue, imValue, angleBezier, cs) {
    //Find the angle in the same orientation than the Bézier's angle
    var a = util.findAngleOrientedVectors2(
      cs,
      { x: reValue, y: imValue },
      that.clockwise === false,
    )
    return util.isInclude(a, 0, angleBezier) === true
  }
  /**
   * Returns the size of the line.
   *
   * @function getSize
   * @memberof util.CurvedLine
   * @instance
   * @return {Size} The size.
   */
  that.getSize = function () {
    var axes = util.findAxes(that.crossAxe)
    var cs = {
      x: that.start[axes.re] - that.center[axes.re],
      y: that.start[axes.im] - that.center[axes.im],
    }
    var radius = getBezierRadius(),
      aBez = getBezierAngle()
    var min = { x: 0, y: 0, z: 0 },
      max = { x: 0, y: 0, z: 0 }
    // Is circle
    if (
      that.start[axes.re] === that.end[axes.re] &&
      that.start[axes.im] === that.end[axes.im]
    ) {
      min[axes.re] = that.center[axes.re] - radius
      min[axes.im] = that.center[axes.im] - radius
      min[axes.cr] = Math.min(that.start[axes.cr], that.end[axes.cr])
      max[axes.re] = that.center[axes.re] + radius
      max[axes.im] = that.center[axes.im] + radius
      max[axes.cr] = Math.max(that.start[axes.cr], that.end[axes.cr])
      return { min: min, max: max }
    }
    min.x = Math.min(that.start.x, that.end.x)
    min.y = Math.min(that.start.y, that.end.y)
    min.z = Math.min(that.start.z, that.end.z)
    max.x = Math.max(that.start.x, that.end.x)
    max.y = Math.max(that.start.y, that.end.y)
    max.z = Math.max(that.start.z, that.end.z)
    if (axeCutArc(0, 1, aBez, cs) === true) {
      max[axes.im] = that.center[axes.im] + radius
    }
    if (axeCutArc(0, -1, aBez, cs) === true) {
      min[axes.im] = that.center[axes.im] - radius
    }
    if (axeCutArc(1, 0, aBez, cs) === true) {
      max[axes.re] = that.center[axes.re] + radius
    }
    if (axeCutArc(-1, 0, aBez, cs) === true) {
      min[axes.re] = that.center[axes.re] - radius
    }
    return { min: min, max: max }
  }
  function initialize(index, start, parsedCommand, settings) {
    that.index = index
    that.word = parsedCommand.type
    that.start = { x: start.x, y: start.y, z: start.z }
    that.end = end
    that.clockwise = parsedCommand.type === 'G2'
    that.center = findCenter(
      start,
      that.end,
      parsedCommand,
      that.clockwise,
      settings.crossAxe,
      settings.inMm,
    )
    that.crossAxe = settings.crossAxe
    if (parsedCommand.f === undefined) {
      that.feedrate = settings.feedrate
    } else {
      that.feedrate = util.calculateFeedrate(parsedCommand.f, settings.inMm)
    }
  }
  initialize(index, start, parsedCommand, settings)
}
export { StraightLine }
export { CurvedLine }
