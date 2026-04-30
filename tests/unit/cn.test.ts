import { describe, expect, it } from 'vitest'
import { cn } from '@/utilities/cn'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b')
  })

  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('accepts conditional object syntax via clsx', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b')
  })

  it('accepts arrays', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })
})
