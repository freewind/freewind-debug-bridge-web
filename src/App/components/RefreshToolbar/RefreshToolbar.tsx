import { Button, Card, Space } from 'antd'
import type { LogsClearResponse } from '../../../api-spec'

type Props = {
  clearLogs: () => Promise<LogsClearResponse | null>
  loadActions: (values?: Record<string, unknown>) => Promise<unknown>
  refreshAll: () => Promise<unknown>
}

export function RefreshToolbar({ clearLogs, loadActions, refreshAll }: Props) {
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
