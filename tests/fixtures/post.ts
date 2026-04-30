import type { Post } from '@/payload-types'

export const postFixture: Partial<Post> = {
  id: 'post-1',
  title: 'First Post',
  slug: 'first-post',
  publishedAt: '2024-04-01T00:00:00.000Z',
  createdAt: '2024-04-01T00:00:00.000Z',
  updatedAt: '2024-04-01T00:00:00.000Z',
  meta: { title: 'First Post', description: 'A short description.' },
}

export const postsListResponse = {
  docs: [postFixture],
  totalDocs: 1,
  page: 1,
  totalPages: 1,
}
