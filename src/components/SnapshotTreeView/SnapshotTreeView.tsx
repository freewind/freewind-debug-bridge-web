import { Space, Tag, Tree, Typography } from 'antd'
import type { DataNode } from 'antd/es/tree'
import type { SnapshotResponse } from '../../generated/api-types'
import { buildSnapshotTree } from '../../utils/buildSnapshotTree'

type Props = {
  snapshot: SnapshotResponse | null
}

export function SnapshotTreeView({ snapshot }: Props) {
  const treeData = buildSnapshotTree(snapshot)

  if (!treeData.length) {
    return <Typography.Text type="secondary">no snapshot tree</Typography.Text>
  }

  function toAntdTreeNode(node: (typeof treeData)[number]): DataNode {
    return {
      children: node.children.map(toAntdTreeNode),
      key: node.id,
      title: (
        <Space size={4} wrap>
          <Typography.Text code>{node.kind}</Typography.Text>
          <Typography.Text code>{`id=${node.id}`}</Typography.Text>
          {node.label ? <Typography.Text type="secondary">{node.label}</Typography.Text> : null}
          {node.clickable ? <Tag color="blue">clickable</Tag> : null}
        </Space>
      ),
    }
  }

  return (
    <div style={{ maxHeight: 420, overflow: 'auto' }}>
      <Tree
        blockNode
        defaultExpandAll
        selectable={false}
        showLine
        style={{ minWidth: 'max-content' }}
        treeData={treeData.map(toAntdTreeNode)}
      />
    </div>
  )
}
