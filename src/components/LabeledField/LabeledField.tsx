import type { ReactNode } from 'react'
import { Form } from 'antd'
import type { FormItemProps } from 'antd'
import { FloatLabel } from 'freewind-ts-utils'

type Props = {
  children: ReactNode
  label: string
  name: FormItemProps['name']
  rules?: FormItemProps['rules']
  width?: number
}

export function LabeledField({ children, label, name, rules, width = 220 }: Props) {
  return (
    <div style={{ width: `min(100%, ${width}px)` }}>
      <Form.Item style={{ marginBottom: 0 }}>
        <FloatLabel label={label} size="small" style={{ width: '100%' }}>
          <Form.Item name={name} noStyle rules={rules}>
            {children}
          </Form.Item>
        </FloatLabel>
      </Form.Item>
    </div>
  )
}
