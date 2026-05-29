import { Button, Card, Flex, Form, Select, Space } from 'antd'
import { JsonPreviewer } from 'freewind-ts-utils/antd'
import type { FC } from 'react'
import { LabeledField } from '../../../components'
import type { ActionCatalogResponse } from '../../../generated/api-types'
import { toOptions } from '../../../utils/toOptions'
import { commonSelectProps, stateScopeOptions } from '../../constants'
import { useAppStore } from '../../store'

type Option = { label: string; value: string }

export const StateTab: FC = () => {
  const actions = useAppStore((store) => store.actions)
  const loadState = useAppStore((store) => store.loadState)
  const stateData = useAppStore((store) => store.stateData)
  const stateForm = useAppStore((store) => store.stateForm)
  const stateKeyOptions: Option[] = toOptions(
    (stateData?.summary?.appStateKeys || []).map((item: { key: string }) => item.key),
  )
  const stateTargetIdOptions: Option[] = toOptions([
    ...(stateData?.summary?.targetStateTargets || []),
    ...(actions?.items || []).map((item: ActionCatalogResponse['items'][number]) => item.targetId),
  ])

  return (
    <Space direction="vertical" size={8} style={{ display: 'flex' }}>
      <Card size="small" title="Query">
        <Form form={stateForm} initialValues={{}} layout="vertical" size="small">
          <Flex vertical gap="small">
            <Flex gap="small" wrap>
              <LabeledField label="keys" name="keys" width={300}>
                <Select {...commonSelectProps} allowClear mode="multiple" options={stateKeyOptions} />
              </LabeledField>
              <LabeledField label="targetId" name="targetId">
                <Select {...commonSelectProps} allowClear options={stateTargetIdOptions} />
              </LabeledField>
              <LabeledField label="scope" name="scope">
                <Select {...commonSelectProps} allowClear options={stateScopeOptions} />
              </LabeledField>
            </Flex>
            <Space size={8}>
              <Button size="small" type="primary" onClick={() => void loadState()}>
                Query State
              </Button>
              <Button size="small" onClick={() => void loadState({})}>
                Summary
              </Button>
            </Space>
          </Flex>
        </Form>
      </Card>

      <Card size="small" title="JSON">
        <JsonPreviewer maxHeight={280} value={stateData ?? {}} />
      </Card>
    </Space>
  )
}
