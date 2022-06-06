/*jslint todo: true, continue: true, white: true*/
//  Written by Alex Canales for ShopBotTools, Inc.
/**
 * A 3D point.
 *
 * @typedef {object} Point
 * @property {number} x - The x coordinate.
 * @property {number} y - The y coordinate.
 * @property {number} z - The z coordinate.
 */
/**
 * A helper for finding axes according to the chosen plane.
 *
 * @typedef {object} Axes
 * @property {string} re - The axis for REal numbers.
 * @property {string} im - The axis for IMaginary numbers.
 * @property {string} cr - The CRoss axis.
 */
/**
 * An object defining a cubic Bézier curve.
 *
 * @typedef {object} Bezier
 * @property {Point} p0 - The first control point.
 * @property {Point} p1 - The second control point.
 * @property {Point} p2 - The third control point.
 * @property {Point} p3 - The fourth control point.
 */
/**
 * An object defining a line.
 *
 * @typedef {object} Line
 * @property {number} lineNumber - The line number in the G-Code file
 * corresponding to the line definition.
 * @property {string} type - The G-Code command.
 * @property {number} feedrate - The feed rate for doing the path defined by
 * the line.
 * @property {Point} [start] - The starting point of the line if type "G0" or
 * "G1".
 * @property {Point} [end] - The ending point of the line if type "G0" or "G1".
 * @property {Bezier[]} [bez] - The bezier curves defining the point if type
 * "G2" or G3".
 */
/**
 * Defines the settings of the G-Code. It changes constantly according to the
 * G-Code commands used.
 *
 * @typedef {object} Settings
 * @property {string} [crossAxe="z"] - The cross axe.
 * @property {number} [feedrate=0] - The feed rate.
 * @property {boolean} [inMm=false] - If the units are in millimeters.
 * @property {Point} [position={x:0, y:0, z:0}] - The last position of the bit.
 * @property {string} [previousMoveCommand=""] - The previous move command
 * ("G0", "G1", "G2", "G3").
 * @property {boolean} [relative=false] - If the coordinates are relative.
 */
/**
 * Defines a single command parsed by the G-Code syntax parser. The definition
 * is not exhaustive.
 *
 * @typedef {object} ParsedCommand
 * @property {string} type - The command type.
 * @property {number} [x] - The X argument.
 * @property {number} [y] - The Y argument.
 * @property {number} [z] - The Z argument.
 * @property {number} [f] - The F argument.
 * @property {number} [r] - The R argument.
 * @property {number} [i] - The I argument.
 * @property {number} [j] - The J argument.
 * @property {number} [k] - The K argument.
 */
/**
 * An object defining the size.
 *
 * @typedef {object} Size
 * @property {Point} min - The lowest values in x, y and z coordinates.
 * @property {Point} max - The highest values in x, y and z coordinates.
 */
/**
 * Errors can happen in G-Code files. It can be simple warning where code is
 * parsed but can have a different behaviour depending on the machine, or it
 * can be a real error and the command is skipped.
 *
 * @typedef {object} Error
 * @property {number} line - The line number where the error occurs.
 * @property {string} message - The message explaining the error.
 * @property {boolean} isSkipped - If the command is skipped.
 */
/**
 * An object defining the parsed G-Code. This is what that should be used by
 * the developper using this library.
 *
 * @typedef {object} ParsedGCode
 * @property {string[]} gcode - The original G-Code, each cell contains a
 * single command.
 * @property {Lines[]} lines - The lines defining the path the bit will take.
 * @property {Size} size - The size the job will take.
 * @property {boolean} displayInInch - If the job shoud be display in inches.
 * @property {Error} errorList - The error the G-Code contains.
 */
/**
 * This file contains useful scripts for different purposes (geometry, object
 * operations...). It also create the util namespace.
 */
'use strict'
/**
 * Namespace for the library.
 *
 * @namespace
 */
var util = {}
/**
 * Constant for converting inches values into millimeters values.
 */
util.INCH_TO_MILLIMETER = 25.4
/**
 * Constant for converting millimeters values into inches values.
 */
util.MILLIMETER_TO_INCH = 0.03937008
/*
 * Precision constant for comparing floats. Used in util.nearlyEqual.
 */
util.FLOAT_PRECISION = 0.001
/*
 * Converts the feedrate in inches according to the types of unit used.
 *
 * @param {number} feedrate - The given feedrate.
 * @param {number} inMm - If the feedrate is in millimeters.
 * Returns the feedrate in inches.
 */
util.calculateFeedrate = function (feedrate, inMm) {
  return inMm === false ? feedrate : feedrate * util.MILLIMETER_TO_INCH
}
/**
 * Checks if two numbers are nearly equal. This function is used to avoid
 * to have too much precision when checking values between floating-point
 * numbers.
 *
 * @param {number} a - Number A.
 * @param {number} b - Number B.
 * @param {number} [precision=util.FLOAT_PRECISION] - The precision
 * of the comparaison.
 * @return {boolean} True if the two values are nearly equal.
 */
util.nearlyEqual = function (a, b, precision) {
  var p = precision === undefined ? util.FLOAT_PRECISION : precision
  return Math.abs(b - a) <= p
}
/**
 * Swaps two objects. It has to be the same objects, too bad if it's not.
 *
 * @param {object} obj1 - The first object.
 * @param {object} obj2 - The second object.
 */
util.swapObjects = function (obj1, obj2) {
  function swapSingleField(objA, objB, key) {
    var temp
    temp = objA[key]
    objA[key] = objB[key]
    objB[key] = temp
  }
  var keys = Object.keys(obj1)
  var i = 0
  for (i = 0; i < keys.length; i++) {
    if (typeof obj1[keys[i]] === 'object') {
      util.swapObjects(obj1[keys[i]], obj2[keys[i]])
    } else {
      swapSingleField(obj1, obj2, keys[i])
    }
  }
}
/**
 * Returns the copy of the object.
 *
 * @param {object} object - The object.
 * @return {object} The copy of the object.
 */
util.copyObject = function (object) {
  var keys = Object.keys(object)
  var i = 0
  var copy = {}
  for (i = 0; i < keys.length; i++) {
    if (typeof object[keys[i]] === 'object') {
      copy[keys[i]] = util.copyObject(object[keys[i]])
    } else {
      copy[keys[i]] = object[keys[i]]
    }
  }
  return copy
}
/**
 * Moves the point according to the vector.
 *
 * @param {Point} point - The point to move.
 * @param {Point} vector - The vector.
 */
util.movePoint = function (point, vector) {
  var keys = Object.keys(vector)
  var i = 0
  for (i = 0; i < keys.length; i++) {
    if (point[keys[i]] !== undefined) {
      point[keys[i]] += vector[keys[i]]
    }
  }
}
/**
 * Does a 2D dot product.
 *
 * @param {Point} v1 - The first vector.
 * @param {Point} v2 - The second vector.
 * @return {number} The result.
 */
util.dotProduct2 = function (v1, v2) {
  return v1.x * v2.x + v1.y * v2.y
}
/**
 * Does a 2D cross product.
 *
 * @param {Point} v1 - The first vector.
 * @param {Point} v2 - The second vector.
 * @return {number} The result on the Z axis.
 */
util.crossProduct2 = function (v1, v2) {
  return v1.x * v2.y - v2.x * v1.y
}
/**
 * Calculates the length of a 3D vector.
 *
 * @param {Point} v - The vector.
 * @return {number} The vector length.
 */
util.lengthVector3 = function (v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}
/**
 * Returns object of 3 axes:
 *  re is the axes for REal numbers;
 *  im for the IMaginary numbers;
 *  cr for the CRoss axis
 *
 * @param {string} crossAxe The name of the axis given by the cross product of
 * the vectors defining the plane. Should be "x", "y" or "z", considered "z" if
 * not "x" or "y".
 * @return {Axes} The object defining the real, imaginary and cross axis.
 */
util.findAxes = function (crossAxe) {
  if (crossAxe.toLowerCase() === 'x') {
    return { re: 'y', im: 'z', cr: 'x' }
  }
  if (crossAxe.toLowerCase() === 'y') {
    return { re: 'z', im: 'x', cr: 'y' }
  }
  return { re: 'x', im: 'y', cr: 'z' }
}
/**
 * Does a rotation and scale of point according to center. Stores the result in
 * newPoint.
 *
 * @param {Point} center - The center of the rotation and scale.
 * @param {Point} point - The point to modify.
 * @param {Point} newPoint - The point storying the result.
 * @param {number} angle - The angle in radians.
 * @param {number} length - The scale ratio.
 * @param {string} re - The real axis.
 * @param {string} im - The imaginary axis.
 */
util.scaleAndRotation = function (
  center,
  point,
  newPoint,
  angle,
  length,
  re,
  im
) {
  var c = center,
    p = point,
    nP = newPoint
  var l = length,
    cA = Math.cos(angle),
    sA = Math.sin(angle)
  var pRe = p[re],
    pIm = p[im],
    cRe = c[re],
    cIm = c[im]
  nP[re] = l * ((pRe - cRe) * cA - (pIm - cIm) * sA) + cRe
  nP[im] = l * ((pIm - cIm) * cA + (pRe - cRe) * sA) + cIm
}
/**
 * Returns the signed angle in radian in 2D (between -PI and PI).
 *
 * @param {Point} v1 - The first vector.
 * @param {Point} v2 - The second vector.
 * @return {number} The angle in radian.
 */
util.findAngleVectors2 = function (v1, v2) {
  var sign = util.crossProduct2(v1, v2) < 0 ? -1 : 1
  var dot = util.dotProduct2(v1, v2)
  var lV1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
  var lV2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
  if (lV1 === 0 || lV2 === 0) {
    return 0
  }
  return sign * Math.acos(dot / (lV1 * lV2))
}
/**
 * Returns the signed angle in radian in 2d (between -2pi and 2pi).
 *
 * @param {Point} v1 - The first vector.
 * @param {Point} v2 - The second vector.
 * @param {boolean} positive - If the oriented angle goes counter-clockwise.
 * @return {number} The angle in radian.
 */
util.findAngleOrientedVectors2 = function (v1, v2, positive) {
  var angle = util.findAngleVectors2(v1, v2)
  if (positive === false && angle > 0) {
    return angle - Math.PI * 2
  }
  if (positive === true && angle < 0) {
    return Math.PI * 2 + angle
  }
  return angle
}
/**
 * Checks if the value is include between the value a (include) and b (include).
 * Order between a and b does not matter.
 *
 * @param {number} value - The value.
 * @param {number} a - The first boundary.
 * @param {number} b - The second boundary.
 * @return {boolean} The result.
 */
util.isInclude = function (value, a, b) {
  return b < a ? b <= value && value <= a : a <= value && value <= b
}
// var keys = Object.keys(util);
// var i = 0;
// for (i = 0; i < keys.length; i++) {
//     exports[keys[i]] = util[keys[i]];
// }
export default util
