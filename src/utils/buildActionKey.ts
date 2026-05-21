export function buildActionKey(targetId: string, action: string) {
  return `${targetId}::${action}`
}
