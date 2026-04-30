import { describe, expect, it } from 'vitest'
import { toKebabCase } from '@/utilities/toKebabCase'

describe('toKebabCase', () => {
  it('splits camelCase', () => {
    expect(toKebabCase('camelCase')).toBe('camel-case')
  })

  it('handles spaces', () => {
    expect(toKebabCase('Hello World')).toBe('hello-world')
  })

  it('mixes camelCase and spaces', () => {
    expect(toKebabCase('myFirstHeading Two')).toBe('my-first-heading-two')
  })

  it('lowercases', () => {
    expect(toKebabCase('ALLCAPS')).toBe('allcaps')
  })

  it('passes through plain lowercase', () => {
    expect(toKebabCase('already-kebab')).toBe('already-kebab')
  })
})
