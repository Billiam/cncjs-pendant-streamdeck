import schema from 'cncjs-pendant-streamdeck-validator/dist/config.schema.json'
import { groupedActions } from '@/lib/grouped-actions'
import { describe, expect, test } from 'vitest'

const actionTypes = schema.definitions.action.properties.action.enum

describe('groupedActions', () => {
  test.concurrent('includes all action types', () => {
    const actions = Object.values(groupedActions).flat().sort()
    expect(actions).toStrictEqual(actionTypes)
  })
})
