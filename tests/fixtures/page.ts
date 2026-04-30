import type { Page } from '@/payload-types'

export const pageFixture: Partial<Page> = {
  id: 'page-1',
  title: 'About',
  slug: 'about',
  hero: {
    type: 'lowImpact',
    richText: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'heading',
            tag: 'h1',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [{ type: 'text', text: 'About', version: 1 }],
          },
        ],
      },
    } as any,
  } as any,
  layout: [
    {
      blockName: 'intro',
      blockType: 'content',
      heading: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [{ type: 'text', text: 'Welcome', version: 1 }],
            },
          ],
        },
      } as any,
      columns: [
        {
          richText: {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  type: 'paragraph',
                  format: '',
                  indent: 0,
                  version: 1,
                  direction: 'ltr',
                  children: [{ type: 'text', text: 'Some intro text.', version: 1 }],
                },
              ],
            },
          } as any,
        } as any,
      ] as any,
    } as any,
  ] as any,
  meta: {
    title: 'About',
    description: 'About the project',
  },
  publishedAt: '2024-03-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-03-01T00:00:00.000Z',
}

export const pagesListResponse = {
  docs: [pageFixture],
  totalDocs: 1,
  page: 1,
  totalPages: 1,
}
