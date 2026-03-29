export function stripUsedIn(obj: any): void {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      stripUsedIn(item)
    }
  } else if (obj && typeof obj === 'object') {
    if ('usedIn' in obj) {
      delete obj.usedIn
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        stripUsedIn(obj[key])
      }
    }
  }
}
