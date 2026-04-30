import { describe, expect, it } from 'vitest'
import deepMerge, { isObject } from '@/utilities/deepMerge'

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
  })

  it('returns falsy for arrays, null, primitives', () => {
    expect(isObject([])).toBeFalsy()
    expect(isObject(null)).toBeFalsy()
    expect(isObject('s')).toBeFalsy()
    expect(isObject(1)).toBeFalsy()
    expect(isObject(undefined)).toBeFalsy()
  })
})

describe('deepMerge', () => {
  it('shallow-merges flat objects', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('overrides primitive values from source', () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 })
  })

  it('recurses into nested objects', () => {
    expect(deepMerge({ a: { b: 1, c: 2 } }, { a: { c: 3, d: 4 } })).toEqual({
      a: { b: 1, c: 3, d: 4 },
    })
  })

  it('replaces arrays rather than merging them', () => {
    expect(deepMerge({ a: [1, 2] }, { a: [3] })).toEqual({ a: [3] })
  })

  it('does not mutate the original target', () => {
    const target = { a: { b: 1 } }
    deepMerge(target, { a: { c: 2 } })
    expect(target).toEqual({ a: { b: 1 } })
  })
})
