export const formatMetaTitle = (rawTitle: string | undefined, isPost: boolean = false): string => {
  const year = new Date().getFullYear()
  if (!rawTitle) {
    return `Auschwitz Visitor Information | ${year}`
  }
  // Only append year for pages, not posts
  return isPost ? rawTitle : `${rawTitle} | ${year}`
}
