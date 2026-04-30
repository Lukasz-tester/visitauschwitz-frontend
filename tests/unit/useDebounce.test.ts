import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/utilities/useDebounce'

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 100))
    expect(result.current).toBe('a')
  })

  it('updates only after the delay elapses', () => {
    vi.useFakeTimers()
    try {
      const { result, rerender } = renderHook(({ v }: { v: string }) => useDebounce(v, 200), {
        initialProps: { v: 'a' },
      })
      rerender({ v: 'b' })
      expect(result.current).toBe('a')
      act(() => {
        vi.advanceTimersByTime(199)
      })
      expect(result.current).toBe('a')
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current).toBe('b')
    } finally {
      vi.useRealTimers()
    }
  })

  it('cancels pending updates when value changes again', () => {
    vi.useFakeTimers()
    try {
      const { result, rerender } = renderHook(({ v }: { v: string }) => useDebounce(v, 100), {
        initialProps: { v: 'a' },
      })
      rerender({ v: 'b' })
      act(() => {
        vi.advanceTimersByTime(50)
      })
      rerender({ v: 'c' })
      act(() => {
        vi.advanceTimersByTime(99)
      })
      expect(result.current).toBe('a')
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current).toBe('c')
    } finally {
      vi.useRealTimers()
    }
  })
})
