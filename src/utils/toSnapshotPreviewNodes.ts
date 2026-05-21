import type { SnapshotPreviewNode, SnapshotResponse } from '../api-spec'

export function toSnapshotPreviewNodes(snapshot: SnapshotResponse | null): SnapshotPreviewNode[] {
  return (snapshot?.nodes || [])
    .filter((node): node is SnapshotPreviewNode => {
      return !!node.bounds && node.visible !== false && node.bounds.width > 0 && node.bounds.height > 0
    })
    .sort((left, right) => {
      return right.bounds.width * right.bounds.height - left.bounds.width * left.bounds.height
    })
}
