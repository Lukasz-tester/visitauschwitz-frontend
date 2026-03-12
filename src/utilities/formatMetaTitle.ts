export const formatMetaTitle = (rawTitle: string | undefined): string => {
  const year = new Date().getFullYear()
  return rawTitle
    ? `${rawTitle} | ${year}`
    : `Auschwitz Visitor Information | ${year}`
}
