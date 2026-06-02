import type { SnapshotResponse } from '../api-contract'

type SnapshotTreeNode = {
  children: SnapshotTreeNode[]
  clickable: boolean
  id: string
  kind: string
  label: string
}

export function buildSnapshotTree(snapshot: SnapshotResponse | null): SnapshotTreeNode[] {
  const nodes = snapshot?.nodes || []
  const byParent = nodes.reduce<Record<string, SnapshotResponse['nodes']>>((result, node) => {
    const parentKey = node.parentId || '__root__'
    const current = result[parentKey] || []
    current.push(node)
    result[parentKey] = current
    return result
  }, {})

  function sortNodes(items: NonNullable<SnapshotResponse['nodes']>) {
    return [...items].sort((left, right) => {
      const topDiff = (left.bounds?.top || 0) - (right.bounds?.top || 0)
      if (topDiff !== 0) {
        return topDiff
      }
      return (left.bounds?.left || 0) - (right.bounds?.left || 0)
    })
  }

  function toTreeNode(node: NonNullable<SnapshotResponse['nodes']>[number]): SnapshotTreeNode {
    return {
      children: sortNodes(byParent[node.id] || []).map(toTreeNode),
      clickable: !!node.clickable,
      id: node.id,
      kind: node.type || node.role || 'Node',
      label: node.text || node.value || '',
    }
  }

  return sortNodes(byParent.__root__ || []).map(toTreeNode)
}
