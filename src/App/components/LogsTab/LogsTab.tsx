import { Button, Card, Flex, Form, Input, InputNumber, Select, Space, Table } from 'antd'
import type { FormInstance } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { JsonPreviewer } from 'freewind-ts-utils'
import type { LogEntry, LogsResponse } from '../../../api-spec'
import { commonSelectProps } from '../../constants'
import { JsonInfoButton, LabeledField } from '../../../components'

type Option = { label: string; value: string }

type Props = {
  clearLogs: () => Promise<unknown>
  loadLogs: (values?: Record<string, unknown>) => Promise<LogsResponse | null>
  logEventOptions: Option[]
  logLevelOptions: Option[]
  logSourceOptions: Option[]
  logTargetIdOptions: Option[]
  logs: LogsResponse | null
  logsForm: FormInstance
  screenOptions: Option[]
}

const logColumns: ColumnsType<LogEntry> = [
  { title: 'seq', dataIndex: 'seq', width: 80 },
  { title: 'time', dataIndex: 'time', width: 170 },
  { title: 'source', dataIndex: 'source', width: 120 },
  { title: 'level', dataIndex: 'level', width: 100 },
  { title: 'event', dataIndex: 'event', width: 140 },
  {
    title: 'targetId',
    dataIndex: 'targetId',
    width: 160,
    render: (value) => value || '-',
  },
  { title: 'summary', dataIndex: 'summary' },
  {
    title: 'data',
    dataIndex: 'data',
    width: 260,
    render: (value) => <JsonPreviewer maxHeight={160} value={value || {}} />,
  },
]

export function LogsTab({
  clearLogs,
  loadLogs,
  logEventOptions,
  logLevelOptions,
  logSourceOptions,
  logTargetIdOptions,
  logs,
  logsForm,
  screenOptions,
}: Props) {
  return (
    <Space direction="vertical" size={8} style={{ display: 'flex' }}>
      <Card size="small" title="Query">
        <Form form={logsForm} initialValues={{ limit: 20 }} layout="vertical" size="small">
          <Flex vertical gap="small">
            <Flex gap="small" wrap>
              <LabeledField label="event" name="event">
                <Select {...commonSelectProps} allowClear options={logEventOptions} />
              </LabeledField>
              <LabeledField label="level" name="level">
                <Select {...commonSelectProps} allowClear options={logLevelOptions} />
              </LabeledField>
              <LabeledField label="source" name="source">
                <Select {...commonSelectProps} allowClear options={logSourceOptions} />
              </LabeledField>
              <LabeledField label="targetId" name="targetId">
                <Select {...commonSelectProps} allowClear options={logTargetIdOptions} />
              </LabeledField>
              <LabeledField label="screen" name="screen">
                <Select {...commonSelectProps} allowClear options={screenOptions} />
              </LabeledField>
              <LabeledField label="from" name="from">
                <Input size="small" style={{ width: '100%' }} />
              </LabeledField>
              <LabeledField label="to" name="to">
                <Input size="small" style={{ width: '100%' }} />
              </LabeledField>
              <LabeledField label="limit" name="limit" width={120}>
                <InputNumber size="small" style={{ width: '100%' }} />
              </LabeledField>
              <LabeledField label="keyword" name="keyword">
                <Input size="small" style={{ width: '100%' }} />
              </LabeledField>
            </Flex>
            <Space size={8} wrap>
              <Button size="small" type="primary" onClick={() => void loadLogs()}>
                Query Logs
              </Button>
              <Button size="small" onClick={() => void loadLogs({})}>
                Summary
              </Button>
              <Button danger size="small" onClick={() => void clearLogs()}>
                Delete Logs
              </Button>
            </Space>
          </Flex>
        </Form>
      </Card>
      <Card size="small" title="Table" extra={<JsonInfoButton title="Logs JSON" value={logs} />}>
        <Table
          columns={logColumns}
          dataSource={logs?.items || []}
          pagination={false}
          rowKey="seq"
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </Space>
  )
}
