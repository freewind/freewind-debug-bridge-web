import { Button, Card, Flex, Form, Input, InputNumber, Select, Space } from 'antd'
import type { FC } from 'react'
import { JsonInfoButton, LabeledField, SnapshotPreview, SnapshotTreeView } from '../../../components'
import type { ActionCatalogResponse, SnapshotNode } from '../../../api-spec'
import { toOptions } from '../../../utils/toOptions'
import { snapshotScopeOptions, triStateOptions } from '../../constants'
import { commonSelectProps } from '../../constants'
import { useAppStore } from '../../store'

type Option = { label: string; value: string }

export const SnapshotTab: FC = () => {
  const actions = useAppStore((store) => store.actions)
  const loadSnapshot = useAppStore((store) => store.loadSnapshot)
  const loadSnapshotSummary = useAppStore((store) => store.loadSnapshotSummary)
  const snapshot = useAppStore((store) => store.snapshot)
  const snapshotForm = useAppStore((store) => store.snapshotForm)
  const snapshotTargetIdOptions: Option[] = toOptions([
    ...(snapshot?.nodes || []).map((item: SnapshotNode) => item.id),
    ...(actions?.items || []).map((item: ActionCatalogResponse['items'][number]) => item.targetId),
  ])
  const snapshotTypeOptions: Option[] = toOptions(
    (snapshot?.nodes || []).map((item: SnapshotNode) => item.type),
  )

  return (
    <Space direction="vertical" size={8} style={{ display: 'flex' }}>
      <Card size="small" title="Query">
        <Form
          form={snapshotForm}
          initialValues={{ limit: 200, types: [] }}
          layout="vertical"
          size="small"
        >
          <Flex vertical gap="small">
            <Flex gap="small" wrap>
              <LabeledField label="targetId" name="targetId">
                <Select {...commonSelectProps} allowClear options={snapshotTargetIdOptions} />
              </LabeledField>
              <LabeledField label="scope" name="scope">
                <Select {...commonSelectProps} allowClear options={snapshotScopeOptions} />
              </LabeledField>
              <LabeledField label="depth" name="depth" width={120}>
                <InputNumber size="small" style={{ width: '100%' }} />
              </LabeledField>
              <LabeledField label="types" name="types" width={300}>
                <Select
                  {...commonSelectProps}
                  allowClear
                  mode="multiple"
                  options={snapshotTypeOptions}
                />
              </LabeledField>
              <LabeledField label="textKeyword" name="textKeyword">
                <Input size="small" style={{ width: '100%' }} />
              </LabeledField>
              <LabeledField label="visible" name="visible">
                <Select {...commonSelectProps} allowClear options={triStateOptions} />
              </LabeledField>
              <LabeledField label="enabled" name="enabled">
                <Select {...commonSelectProps} allowClear options={triStateOptions} />
              </LabeledField>
              <LabeledField label="clickable" name="clickable">
                <Select {...commonSelectProps} allowClear options={triStateOptions} />
              </LabeledField>
              <LabeledField label="limit" name="limit" width={120}>
                <InputNumber size="small" style={{ width: '100%' }} />
              </LabeledField>
            </Flex>
            <Space size={8}>
              <Button size="small" type="primary" onClick={() => void loadSnapshot()}>
                Query Snapshot
              </Button>
              <Button size="small" onClick={() => void loadSnapshotSummary()}>
                Summary
              </Button>
            </Space>
          </Flex>
        </Form>
      </Card>

      <Flex align="start" gap={8} wrap>
        <Card
          size="small"
          title="Preview"
          extra={<JsonInfoButton maxHeight={360} title="Snapshot JSON" value={snapshot} />}
          style={{ flex: '1 1 520px', minWidth: 320 }}
        >
          <SnapshotPreview snapshot={snapshot} />
        </Card>
        <Card size="small" title="Tree" style={{ flex: '1 1 420px', minWidth: 320 }}>
          <SnapshotTreeView snapshot={snapshot} />
        </Card>
      </Flex>
    </Space>
  )
}
