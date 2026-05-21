import { Button, Card, Flex, Form, Input, InputNumber, Select, Space, Table, Tag, Typography } from 'antd'
import type { FormInstance } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { JsonPreviewer } from 'freewind-ts-utils'
import { JsonInfoButton, LabeledField } from '../../../components'
import type { ActionCatalogResponse, ActionRequest, ActionResponse, LogsClearResponse } from '../../../api-spec'
import { commonSelectProps } from '../../constants'
import type { ActionDescriptorView } from '../../types'

type Option = { label: string; value: string }

type Props = {
  actionQueryActionOptions: Option[]
  actionQueryForm: FormInstance
  actionResult: ActionResponse | LogsClearResponse | null
  actionTargetIdOptions: Option[]
  actions: ActionCatalogResponse | null
  fillManualAction: (targetId: string, action: string) => void
  loadActions: (values?: Record<string, unknown>) => Promise<ActionCatalogResponse | null>
  manualActionArgNames: string[]
  manualActionForm: FormInstance
  manualActionOptions: Option[]
  manualActionTargetId?: string
  runAction: (payload: ActionRequest) => Promise<ActionResponse | null>
  runManualAction: () => Promise<ActionResponse | null>
  screenOptions: Option[]
  selectedManualActionDescriptor?: ActionDescriptorView
}

export function ActionTab({
  actionQueryActionOptions,
  actionQueryForm,
  actionResult,
  actionTargetIdOptions,
  actions,
  fillManualAction,
  loadActions,
  manualActionArgNames,
  manualActionForm,
  manualActionOptions,
  manualActionTargetId,
  runAction,
  runManualAction,
  screenOptions,
  selectedManualActionDescriptor,
}: Props) {
  const actionColumns: ColumnsType<ActionCatalogResponse['items'][number]> = [
    {
      title: 'targetId',
      dataIndex: 'targetId',
      width: 180,
      render: (value) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: 'type',
      dataIndex: 'targetType',
      width: 120,
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: 'screen',
      dataIndex: 'screen',
      width: 140,
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: 'actions',
      key: 'actions',
      render: (_, item) => (
        <Space size={4} wrap>
          {item.actions.map((action) => (
            <Space key={`${item.targetId}-${action.name}`} size={4} wrap>
              <Button
                size="small"
                onClick={() => {
                  if (action.args.length) {
                    fillManualAction(item.targetId, action.name)
                    return
                  }
                  void runAction(action.example)
                }}
              >
                {action.args.length ? `Fill ${action.name}` : action.name}
              </Button>
              {action.args.map((argName) => (
                <Tag
                  color={argName === 'text' ? 'gold' : 'default'}
                  key={`${item.targetId}-${action.name}-${argName}`}
                >
                  {argName}
                </Tag>
              ))}
            </Space>
          ))}
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size={8} style={{ display: 'flex' }}>
      <Card size="small" title="Query">
        <Form form={actionQueryForm} initialValues={{}} layout="vertical" size="small">
          <Flex vertical gap="small">
            <Flex gap="small" wrap>
              <LabeledField label="targetId" name="targetId">
                <Select
                  {...commonSelectProps}
                  allowClear
                  options={actionTargetIdOptions}
                  onChange={() => actionQueryForm.setFieldValue('action', undefined)}
                />
              </LabeledField>
              <LabeledField label="action" name="action">
                <Select {...commonSelectProps} allowClear options={actionQueryActionOptions} />
              </LabeledField>
              <LabeledField label="screen" name="screen">
                <Select {...commonSelectProps} allowClear options={screenOptions} />
              </LabeledField>
            </Flex>
            <Button size="small" type="primary" onClick={() => void loadActions()}>
              Load Actions
            </Button>
          </Flex>
        </Form>
      </Card>

      <Card
        size="small"
        title="Action Table"
        extra={<JsonInfoButton title="Action Catalog JSON" value={actions} />}
      >
        <Table
          columns={actionColumns}
          dataSource={actions?.items || []}
          pagination={false}
          rowKey="targetId"
          scroll={{ x: 760 }}
          size="small"
        />
      </Card>

      <Card size="small" title="Manual Action">
        <Form
          form={manualActionForm}
          initialValues={{ argValues: {}, source: 'human' }}
          layout="vertical"
          size="small"
        >
          <Flex vertical gap="small">
            {selectedManualActionDescriptor ? (
              <Space size={4} wrap>
                <Typography.Text type="secondary">
                  {selectedManualActionDescriptor.summary}
                </Typography.Text>
                {selectedManualActionDescriptor.args.length ? (
                  selectedManualActionDescriptor.args.map((argName) => (
                    <Tag color={argName === 'text' ? 'gold' : 'default'} key={`manual-${argName}`}>
                      {argName}
                    </Tag>
                  ))
                ) : (
                  <Tag color="green">no args</Tag>
                )}
              </Space>
            ) : null}
            <Flex gap="small" wrap>
              <LabeledField label="targetId" name="targetId" rules={[{ required: true }]}>
                <Select
                  {...commonSelectProps}
                  options={actionTargetIdOptions}
                  onChange={(value) =>
                    manualActionForm.setFieldsValue({
                      action: undefined,
                      argValues: {},
                      dx: undefined,
                      dy: undefined,
                      targetId: value,
                      text: undefined,
                    })
                  }
                />
              </LabeledField>
              <LabeledField label="action" name="action" rules={[{ required: true }]}>
                <Select
                  {...commonSelectProps}
                  options={manualActionOptions}
                  onChange={(value) => {
                    if (value && manualActionTargetId) {
                      fillManualAction(manualActionTargetId, value)
                      return
                    }
                    manualActionForm.setFieldValue('action', value)
                  }}
                />
              </LabeledField>
              <LabeledField label="source" name="source">
                <Input size="small" style={{ width: '100%' }} />
              </LabeledField>
              <LabeledField label="text" name="text">
                <Input size="small" style={{ width: '100%' }} />
              </LabeledField>
              <LabeledField label="dx" name="dx" width={120}>
                <InputNumber size="small" style={{ width: '100%' }} />
              </LabeledField>
              <LabeledField label="dy" name="dy" width={120}>
                <InputNumber size="small" style={{ width: '100%' }} />
              </LabeledField>
            </Flex>
            {manualActionArgNames.length ? (
              <Flex gap="small" wrap>
                {manualActionArgNames.map((argName) => (
                  <LabeledField key={argName} label={argName} name={['argValues', argName]}>
                    <Input size="small" style={{ width: '100%' }} />
                  </LabeledField>
                ))}
              </Flex>
            ) : null}
            <Space size={8}>
              <Button size="small" type="primary" onClick={() => void runManualAction()}>
                Send Action
              </Button>
            </Space>
          </Flex>
        </Form>
      </Card>

      <Card size="small" title="Latest Result">
        <JsonPreviewer maxHeight={280} value={actionResult ?? {}} />
      </Card>
    </Space>
  )
}
