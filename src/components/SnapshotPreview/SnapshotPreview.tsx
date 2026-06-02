import { useRef } from 'react'
import { useSize } from 'ahooks'
import { Typography } from 'antd'
import type { SnapshotResponse } from '../../api-contract'
import { toSnapshotPreviewNodes } from '../../utils/toSnapshotPreviewNodes'

const snapshotPreviewFallbackWidth = 520

type Props = {
  snapshot: SnapshotResponse | null
}

export function SnapshotPreview({ snapshot }: Props) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const shellSize = useSize(shellRef)
  const nodes = toSnapshotPreviewNodes(snapshot)

  if (!nodes.length) {
    return <Typography.Text type="secondary">no bounded nodes，先点 Query Snapshot</Typography.Text>
  }

  const minLeft = Math.min(...nodes.map((item) => item.bounds.left))
  const minTop = Math.min(...nodes.map((item) => item.bounds.top))
  const maxRight = Math.max(...nodes.map((item) => item.bounds.left + item.bounds.width))
  const maxBottom = Math.max(...nodes.map((item) => item.bounds.top + item.bounds.height))
  const width = Math.max(1, maxRight - minLeft)
  const height = Math.max(1, maxBottom - minTop)
  const canvasWidth = Math.max(420, Math.floor((shellSize?.width ?? snapshotPreviewFallbackWidth) - 2))
  const scale = canvasWidth / width
  const canvasHeight = Math.max(220, Math.ceil(height * scale))

  return (
    <div ref={shellRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Text type="secondary">
          {snapshot?.screen || snapshot?.summary?.screen || 'Unknown'} · {nodes.length} nodes
        </Typography.Text>
      </div>
      <div
        style={{
          background: '#fafafa',
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          height: canvasHeight,
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
        }}
      >
        {nodes.map((node) => {
          const label = node.text || node.value || node.id
          const typeLabel = node.type || node.role || 'Node'
          const kind = (node.role || node.type || '').toLowerCase()
          const isTextLike = kind === 'text' || kind === 'label'
          const isContainer = kind === 'container' || kind === 'panel'
          const scaledWidth = node.bounds.width * scale
          const scaledHeight = node.bounds.height * scale
          const showLabel = scaledWidth >= 18 && scaledHeight >= 8
          const fontSize = Math.max(7, Math.min(14, Math.floor(scaledHeight * 0.5)))

          return (
            <div
              key={node.id}
              style={{
                background: isTextLike
                  ? 'transparent'
                  : isContainer
                    ? 'rgba(250, 250, 250, 0.28)'
                    : node.clickable
                      ? 'rgba(230, 244, 255, 0.92)'
                      : 'rgba(255, 255, 255, 0.92)',
                border: isTextLike
                  ? 'none'
                  : isContainer
                    ? '1px dashed #d9d9d9'
                    : node.clickable
                      ? '1px solid #1677ff'
                      : '1px solid #bfbfbf',
                borderRadius: isTextLike ? 0 : 6,
                boxSizing: 'border-box',
                color: '#262626',
                fontSize,
                height: Math.max(scaledHeight, 10),
                left: (node.bounds.left - minLeft) * scale,
                lineHeight: 1.2,
                overflow: 'hidden',
                padding: isTextLike ? 0 : '2px 4px',
                position: 'absolute',
                top: (node.bounds.top - minTop) * scale,
                width: Math.max(scaledWidth, 12),
              }}
              title={`${node.id} / ${typeLabel}${label ? ` / ${label}` : ''}`}
            >
              {showLabel ? (
                <>
                  {!isContainer ? (
                    <div
                      style={{
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </div>
                  ) : null}
                  {!isTextLike && !isContainer ? (
                    <div
                      style={{
                        color: '#8c8c8c',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {typeLabel}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
