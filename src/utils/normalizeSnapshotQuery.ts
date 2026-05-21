const snapshotPreviewFields = [
  'id',
  'parentId',
  'type',
  'text',
  'role',
  'visible',
  'enabled',
  'clickable',
  'value',
  'bounds',
].join(',')

export function normalizeSnapshotQuery(values?: Record<string, unknown>) {
  const next: Record<string, unknown> = { ...(values || {}) }
  next.fields = snapshotPreviewFields
  if (next.limit === undefined || next.limit === null || next.limit === '') {
    next.limit = 200
  }
  return next
}
