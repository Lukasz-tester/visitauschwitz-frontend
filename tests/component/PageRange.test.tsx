import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '../helpers/render'
import { PageRange } from '@/components/PageRange'

describe('PageRange', () => {
  it('shows "no results" when totalDocs is 0', () => {
    const { container } = renderWithIntl(<PageRange totalDocs={0} />)
    expect(container.textContent).toMatch(/no results/i)
  })

  it('shows "no results" when totalDocs is undefined', () => {
    const { container } = renderWithIntl(<PageRange />)
    expect(container.textContent).toMatch(/no results/i)
  })

  it('renders a range for a non-empty result set (singular)', () => {
    const { container } = renderWithIntl(<PageRange currentPage={1} limit={10} totalDocs={1} />)
    expect(container.textContent).toMatch(/1.*of.*1/i)
  })

  it('renders a range for plural results', () => {
    const { container } = renderWithIntl(<PageRange currentPage={1} limit={10} totalDocs={25} />)
    expect(container.textContent).toMatch(/1.*-.*10.*of.*25/i)
  })

  it('clamps indexEnd to totalDocs on the last page', () => {
    const { container } = renderWithIntl(<PageRange currentPage={3} limit={10} totalDocs={25} />)
    expect(container.textContent).toMatch(/21.*-.*25.*of.*25/i)
  })
})
