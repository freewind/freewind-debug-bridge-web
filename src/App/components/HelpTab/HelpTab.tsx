import { Card, Space } from 'antd'
import { JsonPreviewer } from 'freewind-ts-utils'
import type { HelpResponse } from '../../../api-spec'

type Props = {
  help: HelpResponse | null
}

export function HelpTab({ help }: Props) {
  return (
    <Space direction="vertical" size={8} style={{ display: 'flex' }}>
      <Card size="small" title="JSON">
        <JsonPreviewer maxHeight={280} value={help ?? {}} />
      </Card>
    </Space>
  )
}
