import { InfoCircleOutlined } from '@ant-design/icons'
import { Button, Popover } from 'antd'
import { JsonPreviewer } from 'freewind-ts-utils'

type Props = {
  title: string
  value: unknown
  maxHeight?: number
}

export function JsonInfoButton({ title, value, maxHeight = 320 }: Props) {
  return (
    <Popover
      content={
        <div style={{ maxWidth: '70vw', width: 420 }}>
          <JsonPreviewer maxHeight={maxHeight} value={value ?? {}} />
        </div>
      }
      placement="leftTop"
      title={title}
      trigger="click"
    >
      <Button icon={<InfoCircleOutlined />} size="small" type="text" />
    </Popover>
  )
}
