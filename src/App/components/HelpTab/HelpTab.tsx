import type { FC } from 'react'
import { Card, Space } from 'antd'
import { JsonPreviewer } from 'freewind-ts-utils'
import { useAppStore } from '../../store'

export const HelpTab: FC = () => {
  const help = useAppStore((store) => store.help)

  return (
    <Space direction="vertical" size={8} style={{ display: 'flex' }}>
      <Card size="small" title="JSON">
        <JsonPreviewer maxHeight={280} value={help ?? {}} />
      </Card>
    </Space>
  )
}
