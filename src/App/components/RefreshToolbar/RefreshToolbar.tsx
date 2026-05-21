import type { FC } from 'react'
import { Button, Card, Space } from 'antd'
import { useAppStore } from '../../store'

export const RefreshToolbar: FC = () => {
  const clearLogs = useAppStore((store) => store.clearLogs)
  const loadActions = useAppStore((store) => store.loadActions)
  const refreshAll = useAppStore((store) => store.refreshAll)

  return (
    <Card size="small">
      <Space size={8} wrap>
        <Button size="small" type="primary" onClick={() => void refreshAll()}>
          Refresh All
        </Button>
        <Button size="small" onClick={() => void loadActions({})}>
          Refresh Actions
        </Button>
        <Button danger size="small" onClick={() => void clearLogs()}>
          Clear Logs
        </Button>
      </Space>
    </Card>
  )
}
