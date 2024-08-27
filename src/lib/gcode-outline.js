import { parse } from '@/vendor/gcodetogeometry/gcodetogeometry'
import { pointsOnBezierCurves } from 'points-on-curve'
import hull from 'hull.js'

export const gcodeToPoints = (gcode) => {
  // strip lines beginning with % or containing [
  const parsedGcode = parse(
    gcode.replace(/^%.*/gm, '').replace(/^.*\[.*/gm, '')
  )

  return parsedGcode.lines.reduce((points, line) => {
    if (line.type === 'G1') {
      points.push([line.start.x, line.start.y], [line.end.x, line.end.y])
    } else if (line.type === 'G2' || line.type === 'G3') {
      line.beziers.forEach((point) => {
        if (point.p1.x && point.p1.y && point.p2.x && point.p2.y) {
          const curvePoints = pointsOnBezierCurves(
            [
              [point.p0.x, point.p0.y],
              [point.p1.x, point.p1.y],
              [point.p2.x, point.p2.y],
              [point.p3.x, point.p3.y],
            ],
            0.1,
            0.1
          )
        } else {
          points.push([point.p0.x, point.p0.y], [point.p3.x, point.p3.y])
        }
      })
    }
    return points
  }, [])
}

const withModal = (gcode) =>
  `
%DISTANCE=modal.distance
%UNITS=modal.units
%START_X=mposx
%START_Y=mposy
G0 G20 G91 Z0.2
G90
${gcode}
G53 G0 G21 G90 X[START_X] Y[START_Y]
G0 G91 Z-0.2
[DISTANCE][UNITS]
`.trim()

export const pointsToGcode = (points) => {
  const pointGcode = points.map(
    ([x, y]) => `G0 X${x.toFixed(4)} Y${y.toFixed(4)}`
  )
  const sleep = 'G04 p.5'
  pointGcode.splice(1, 0, sleep)
  pointGcode.push(sleep)
  return withModal(pointGcode.join('\n'))
}

export const orderByClosest = (points, x, y) => {
  const closestIndex = points.reduce(
    (closest, [px, py], index) => {
      const distance = (x - px) ** 2 + (y - py) ** 2

      if (distance < closest.distance) {
        closest.index = index
        closest.distance = distance
      }
      return closest
    },
    {
      index: 0,
      distance: Infinity,
    }
  )
  const index = closestIndex.index

  if (index > 0) {
    return [...points.slice(index), ...points.slice(0, index)]
  }
  return points
}

const returnToEnd = (points) => [...points, points[0]]

export const buildOutline = (gcode, x, y) => {
  const points = gcodeToPoints(gcode)

  const impX = x / 25.4
  const impY = y / 25.4

  const hullPoints = hull(points)
  const path = returnToEnd(orderByClosest(hullPoints, impX, impY))

  return pointsToGcode(path)
}
