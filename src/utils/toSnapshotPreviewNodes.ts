import type { SnapshotNode, SnapshotResponse } from '../generated/api-types'

export type SnapshotPreviewNode = SnapshotNode & {
  bounds: NonNullable<SnapshotNode['bounds']>
}

export function toSnapshotPreviewNodes(snapshot: SnapshotResponse | null): SnapshotPreviewNode[] {
  return (snapshot?.nodes || [])
    .filter((node): node is SnapshotPreviewNode => {
      return !!node.bounds && node.visible !== false && node.bounds.width > 0 && node.bounds.height > 0
    })
    .sort((left, right) => {
      return right.bounds.width * right.bounds.height - left.bounds.width * left.bounds.height
    })
}
