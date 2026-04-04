export function withTrailingSlash(path: string): string {
  if (!path) return path
  if (path.startsWith('http') || path.startsWith('//')) return path
  if (path.startsWith('#')) return path
  if (path.startsWith('/api/') || path.startsWith('/_next/')) return path

  const match = path.match(/^([^?#]*)([?#].*)?$/)
  if (!match) return path
  const [, base, rest = ''] = match
  if (!base || base.endsWith('/')) return path
  return base + '/' + rest
}
