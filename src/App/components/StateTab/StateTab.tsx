import { Button, Card, Flex, Form, Select, Space } from 'antd'
import type { FormInstance } from 'antd'
import { JsonPreviewer } from 'freewind-ts-utils'
import { LabeledField } from '../../../components'
import type { StateResponse } from '../../../api-spec'
import { commonSelectProps, stateScopeOptions } from '../../constants'

type Option = { label: string; value: string }

type Props = {
  loadState: (values?: Record<string, unknown>) => Promise<StateResponse | null>
  stateData: StateResponse | null
  stateForm: FormInstance
  stateKeyOptions: Option[]
  stateTargetIdOptions: Option[]
}

export function StateTab({
  loadState,
  stateData,
  stateForm,
  stateKeyOptions,
  stateTargetIdOptions,
}: Props) {
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
