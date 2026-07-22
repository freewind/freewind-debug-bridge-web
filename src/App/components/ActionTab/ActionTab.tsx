import { Button, Card, Flex, Form, Input, InputNumber, Select, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { JsonPreviewer } from 'freewind-code-utils/src/antd'
import type { FC } from 'react'
import { JsonInfoButton, LabeledField } from '../../../components'
import type { ActionCatalogResponse } from '../../../api-contract'
import { buildActionKey } from '../../../utils/buildActionKey'
import { toOptions } from '../../../utils/toOptions'
import { commonSelectProps } from '../../constants'
import type { ActionDescriptorView } from '../../types'
import { useAppStore } from '../../store'

type Option = { label: string; value: string }

export const ActionTab: FC = () => {
  const actionQueryForm = useAppStore((store) => store.actionQueryForm)
  const actionQueryTargetId = useAppStore((store) => store.actionQueryTargetId)
  const actionResult = useAppStore((store) => store.actionResult)
  const actions = useAppStore((store) => store.actions)
  const fillManualAction = useAppStore((store) => store.fillManualAction)
  const loadActions = useAppStore((store) => store.loadActions)
  const manualActionAction = useAppStore((store) => store.manualActionAction)
  const manualActionForm = useAppStore((store) => store.manualActionForm)
  const manualActionTargetId = useAppStore((store) => store.manualActionTargetId)
  const runAction = useAppStore((store) => store.runAction)
  const runManualAction = useAppStore((store) => store.runManualAction)
  const stateData = useAppStore((store) => store.stateData)
  const help = useAppStore((store) => store.help)
  const logs = useAppStore((store) => store.logs)
  const snapshot = useAppStore((store) => store.snapshot)
  const actionTargetIdOptions = toOptions([
    ...(actions?.items || []).map((item: ActionCatalogResponse['items'][number]) => item.targetId),
    ...(stateData?.summary?.targetStateTargets || []),
  ])
  const actionDescriptors: ActionDescriptorView[] = (actions?.items || []).flatMap((item) => {
    return item.actions.map((action) => ({
      ...action,
      targetId: item.targetId,
      targetType: item.targetType,
      screen: item.screen,
    }))
  })
  const actionDescriptorByKey = actionDescriptors.reduce<Record<string, ActionDescriptorView>>((result, item) => {
    result[buildActionKey(item.targetId, item.name)] = item
    return result
  }, {})
  const actionsByTargetId = (actions?.items || []).reduce<Record<string, string[]>>((result, item) => {
    result[item.targetId] = item.actions.map((action: ActionCatalogResponse['items'][number]['actions'][number]) => action.name)
    return result
  }, {})
  const actionNameOptions = toOptions(
    (actions?.items || []).flatMap((item) =>
      item.actions.map((action: ActionCatalogResponse['items'][number]['actions'][number]) => action.name),
    ),
  )
  const actionQueryActionOptions = actionQueryTargetId
    ? toOptions(actionsByTargetId[actionQueryTargetId] || [])
    : actionNameOptions
  const manualActionOptions = manualActionTargetId
    ? toOptions(actionsByTargetId[manualActionTargetId] || [])
    : actionNameOptions
  const selectedManualActionDescriptor =
    manualActionTargetId && manualActionAction
      ? actionDescriptorByKey[buildActionKey(manualActionTargetId, manualActionAction)]
      : undefined
  const manualActionArgNames = (selectedManualActionDescriptor?.args || []).filter((name) => name !== 'text')
  const screenOptions: Option[] = toOptions([
    help?.screenName,
    snapshot?.screen,
    snapshot?.summary?.screen,
    ...(actions?.items || []).map((item: ActionCatalogResponse['items'][number]) => item.screen),
    ...(logs?.items || []).map((item) => item.data?.screen),
  ])

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
