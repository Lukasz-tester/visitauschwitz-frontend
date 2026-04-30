import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

// Stub every block component so dispatch can be verified by blockType
// without dragging in client-only dependencies. Factories are fully inlined
// because vi.mock hoists above any module-scope identifiers.
vi.mock('@/blocks/ArchiveBlock/Component', () => ({
  ArchiveBlock: ({ blockName }: any) => <div data-block="archive" data-block-name={blockName} />,
}))
vi.mock('@/blocks/CallToAction/Component', () => ({
  CallToActionBlock: ({ blockName }: any) => <div data-block="cta" data-block-name={blockName} />,
}))
vi.mock('@/blocks/Content/Component', () => ({
  ContentBlock: ({ blockName }: any) => <div data-block="content" data-block-name={blockName} />,
}))
vi.mock('@/blocks/Form/Component', () => ({
  FormBlock: ({ blockName }: any) => <div data-block="formBlock" data-block-name={blockName} />,
}))
vi.mock('@/blocks/MediaBlock/Component.client', () => ({
  MediaBlock: ({ blockName }: any) => <div data-block="mediaBlock" data-block-name={blockName} />,
}))
vi.mock('@/blocks/OpeningHours/Component.client', () => ({
  OpeningHoursBlock: ({ blockName }: any) => <div data-block="oh" data-block-name={blockName} />,
}))
vi.mock('@/blocks/Accordion/Component.client', () => ({
  AccordionBlock: ({ blockName }: any) => <div data-block="accordion" data-block-name={blockName} />,
}))
vi.mock('@/blocks/Code/Component', () => ({
  ImageBlock: ({ blockName }: any) => <div data-block="Image" data-block-name={blockName} />,
}))
vi.mock('@/blocks/Banner/Component', () => ({
  TextBlock: ({ blockName }: any) => <div data-block="Text" data-block-name={blockName} />,
}))
vi.mock('@/blocks/BankTransfer/Component', () => ({
  BankTransferBlock: ({ blockName }: any) => <div data-block="bankTransfer" data-block-name={blockName} />,
}))

import { RenderBlocks } from '@/blocks/RenderBlocks'

describe('RenderBlocks dispatcher', () => {
  it('renders nothing for empty input', () => {
    const { container } = render(
      <RenderBlocks blocks={[] as any} locale={'en' as any} url="/x" />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('dispatches blocks to the right component by blockType', () => {
    const blocks = [
      { blockType: 'content', blockName: 'a' },
      { blockType: 'cta', blockName: 'b' },
      { blockType: 'mediaBlock', blockName: 'c' },
      { blockType: 'unknown-type', blockName: 'should-be-ignored' },
    ]
    const { container } = render(
      <RenderBlocks blocks={blocks as any} locale={'en' as any} url="/x" />,
    )
    const stubs = Array.from(container.querySelectorAll('[data-block]'))
    expect(stubs.map((el) => el.getAttribute('data-block'))).toEqual([
      'content',
      'cta',
      'mediaBlock',
    ])
  })

  it('wraps each block in a div with the blockName as id', () => {
    const { container } = render(
      <RenderBlocks
        blocks={[{ blockType: 'content', blockName: 'intro' }] as any}
        locale={'en' as any}
        url="/x"
      />,
    )
    expect(container.querySelector('#intro')).not.toBeNull()
  })

  it('inserts an extra node at insertAtIndex', () => {
    const { container } = render(
      <RenderBlocks
        blocks={[
          { blockType: 'content', blockName: 'a' },
          { blockType: 'content', blockName: 'b' },
        ] as any}
        locale={'en' as any}
        url="/x"
        insertAtIndex={1}
        insertNode={<div data-marker="inserted" />}
      />,
    )
    expect(container.querySelector('[data-marker="inserted"]')).not.toBeNull()
  })
})
