import {
  orderByClosest,
  gcodeToPoints,
  pointsToGcode,
} from '@/lib/gcode-outline'
import { describe, expect, test } from 'vitest'

describe('orderByClosest', () => {
  test.concurrent('begins at nearest point', () => {
    const points = [
      [2, 2],
      [2, 1],
      [1, 1],
      [1, 2],
    ]

    const orderedPoints = orderByClosest(points, 1, 1)
    expect(orderedPoints).toStrictEqual([
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 1],
    ])
  })

  test.concurrent('it makes no changes when already at nearest point', () => {
    const points = [
      [2, 2],
      [2, 1],
      [1, 1],
      [1, 2],
    ]

    const orderedPoints = orderByClosest(points, 3, 3)
    expect(orderedPoints).toStrictEqual(points)
  })
})

describe('gcodeToPoints', () => {
  test.concurrent(
    'it converts straight line movements to start/end points',
    () => {
      const input = `G20 G90
G0 X1 Y2 F200
G1 X11 Y12 F200
`
      const points = gcodeToPoints(input)
      expect(points).toStrictEqual([
        [1, 2],
        [11, 12],
      ])
    }
  )

  test.concurrent(
    'it converts curve line movements to points along path',
    () => {
      const input = `G20 G90
G17
G0 X0Y20
G2 X20Y0 I0 J-20.0
`
      const points = gcodeToPoints(input)
      expect.soft(points[0]).toEqual([0, 20])
      expect.soft(points[points.length - 1]).toEqual([20, 0])

      const xPoints = points.map(([x, y]) => x)
      const yPoints = points.map(([x, y]) => y)

      expect.soft(xPoints).toStrictEqual([...xPoints].sort((a, b) => a - b))
      expect.soft(yPoints).toStrictEqual([...yPoints].sort((a, b) => b - a))
    }
  )
})

describe('pointsToGcode', () => {
  test.concurrent('limits coordinates to 4 decimal places', () => {
    const input = [
      [0, 1.123456],
      [10, 20.2],
    ]
    const result = pointsToGcode(input, 'in')
    expect.soft(result).toContain('G0 X0 Y1.1235')
    expect.soft(result).toContain('G0 X10 Y20.2')
  })

  test.concurrent('reads and restores modal state', () => {
    const result = pointsToGcode([], 'in')
    expect.soft(result).toContain('%DISTANCE=modal.distance')
    expect.soft(result).toContain('%UNITS=modal.units')
    expect.soft(result.endsWith('[DISTANCE][UNITS]')).toEqual(true)
  })

  test.concurrent('reads and restores position', () => {
    const result = pointsToGcode([], 'in')
    expect.soft(result).toContain('%START_X=posx')
    expect.soft(result).toContain('%START_Y=posy')

    expect.soft(result).toContain('G0 G20 G90 X[START_X] Y[START_Y]')
  })

  test.concurrent('uses correct units to return to position', () => {
    const result = pointsToGcode([], 'mm')
    expect.soft(result).toContain('%START_X=posx')
    expect.soft(result).toContain('%START_Y=posy')

    expect.soft(result).toContain('G0 G21 G90 X[START_X] Y[START_Y]')
  })

  test.concurrent('sleeps around perimeter movement', () => {
    const input = [
      [0, 0],
      [5, 10],
    ]
    const result = pointsToGcode(input, 'in')
    expect.soft(result).toContain(
      `G0 X0 Y0
G04 P.5
G0 X5 Y10
G04 P.5`
    )
  })
})
