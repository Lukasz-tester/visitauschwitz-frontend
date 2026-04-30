import { describe, expect, it } from 'vitest'
import { formatDateTime } from '@/utilities/formatDateTime'

describe('formatDateTime', () => {
  it('formats an ISO date as MM/DD/YYYY', () => {
    expect(formatDateTime('2024-03-09T10:00:00Z')).toMatch(/^\d{2}\/\d{2}\/2024$/)
  })

  it('zero-pads single-digit months and days', () => {
    const out = formatDateTime('2024-01-05T12:00:00Z')
    // month/day local-time may vary by TZ at edges; assert padding shape
    expect(out).toMatch(/^\d{2}\/\d{2}\/2024$/)
    const [mm, dd] = out.split('/')
    expect(mm).toHaveLength(2)
    expect(dd).toHaveLength(2)
  })

  it('falls back to "now" for empty input', () => {
    const out = formatDateTime('')
    expect(out).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})
