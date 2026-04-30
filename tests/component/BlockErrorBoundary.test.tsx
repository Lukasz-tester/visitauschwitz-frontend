import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BlockErrorBoundary } from '@/blocks/BlockErrorBoundary'

function Boom(): JSX.Element {
  throw new Error('block crash')
}

describe('BlockErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <BlockErrorBoundary blockType="content">
        <div>visible</div>
      </BlockErrorBoundary>,
    )
    expect(screen.getByText('visible')).toBeInTheDocument()
  })

  it('renders nothing when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(
      <BlockErrorBoundary blockType="content">
        <Boom />
      </BlockErrorBoundary>,
    )
    expect(container.textContent).toBe('')
    spy.mockRestore()
  })
})
