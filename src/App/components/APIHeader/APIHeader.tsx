import { Button, Input, Layout, Space, Tag, Typography } from 'antd'

type Props = {
  apiBaseURLInput: string
  apiBaseURLLabel: string
  applyAPIBaseURL: (nextValue?: string) => Promise<unknown>
  consoleTitle: string
  headerAppName: string
  headerBuildVersion?: number
  headerStatus: string
  setApiBaseURLInput: (value: string) => void
}

export function APIHeader({
  apiBaseURLInput,
  apiBaseURLLabel,
  applyAPIBaseURL,
  consoleTitle,
  headerAppName,
  headerBuildVersion,
  headerStatus,
  setApiBaseURLInput,
}: Props) {
  return (
    <Layout.Header
      style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        paddingInline: 16,
        paddingBlock: 8,
        height: 'auto',
        lineHeight: 1.2,
      }}
    >
      <Space
        align="center"
        size={12}
        style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
        wrap
      >
        <Space direction="vertical" size={2}>
          <Typography.Title level={4} style={{ lineHeight: '32px', margin: 0, paddingTop: 6 }}>
            {consoleTitle}
          </Typography.Title>
          <Space size={8} wrap>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {headerAppName}
            </Typography.Text>
            {headerBuildVersion !== undefined ? (
              <Tag color="blue" style={{ fontWeight: 600 }}>{`v${headerBuildVersion}`}</Tag>
            ) : null}
            <Typography.Text type="secondary">{headerStatus}</Typography.Text>
          </Space>
        </Space>
        <Space size={8} style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Typography.Text type="secondary">{`API ${apiBaseURLLabel}`}</Typography.Text>
          <Input
            placeholder="http://127.0.0.1:9001"
            size="small"
            style={{ width: 'min(360px, calc(100vw - 120px))' }}
            value={apiBaseURLInput}
            onChange={(event) => setApiBaseURLInput(event.target.value)}
            onPressEnter={() => void applyAPIBaseURL()}
          />
          <Button size="small" type="primary" onClick={() => void applyAPIBaseURL()}>
            Apply
          </Button>
        </Space>
      </Space>
    </Layout.Header>
  )
}
