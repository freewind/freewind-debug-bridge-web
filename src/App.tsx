import type { CSSProperties, FC, ReactNode } from 'react'
import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react'
import {
  App as AntdApp,
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Layout,
  Popover,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tree,
  Typography,
  type FormItemProps,
} from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DataNode } from 'antd/es/tree'
import { buildQuery, fetchJSON } from './api'
import { FloatLabel } from '@freewind/FloatLabel'
import { JsonPreviewer } from '@freewind/JsonPreviewer'
import type {
  ActionCatalogResponse,
  ActionRequest,
  ActionResponse,
  HelpResponse,
  LogEntry,
  LogsClearResponse,
  LogsResponse,
  MetaResponse,
  SnapshotPreviewNode,
  SnapshotResponse,
  StateResponse,
} from './types'

type SnapshotTreeNode = {
  id: string
  kind: string
  label: string
  clickable: boolean
  children: SnapshotTreeNode[]
}

type ActionDescriptorView = ActionCatalogResponse['items'][number]['actions'][number] & {
  targetId: string
  targetType: string
  screen: string
}

type ManualActionFormValues = {
  targetId?: string
  action?: string
  source?: string
  text?: string
  dx?: number | null
  dy?: number | null
  argValues?: Record<string, string>
}

const { Header, Content } = Layout
const { Title, Text } = Typography
const apiBaseURLStorageKey = 'freewind-debug-bridge-web/api-base-url'
const commonSelectProps = {
  popupMatchSelectWidth: false,
  optionFilterProp: 'label' as const,
  showSearch: true,
  size: 'small' as const,
}
const snapshotPreviewFallbackWidth = 520
const queryFieldWidth = 220
const queryFieldNumberWidth = 120
const queryFieldWideWidth = 300
const snapshotPreviewShellStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} satisfies CSSProperties
const snapshotPreviewBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
} satisfies CSSProperties
const snapshotPreviewCanvasStyle = {
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  border: '1px solid #d9d9d9',
  borderRadius: 8,
  background: '#fafafa',
} satisfies CSSProperties
const snapshotPreviewNodeBaseStyle = {
  position: 'absolute',
  overflow: 'hidden',
  border: '1px solid #bfbfbf',
  borderRadius: 6,
  padding: '2px 4px',
  background: 'rgba(255, 255, 255, 0.92)',
  color: '#262626',
  lineHeight: 1.2,
  boxSizing: 'border-box',
} satisfies CSSProperties
const snapshotPreviewNodeClickableStyle = {
  borderColor: '#1677ff',
  background: 'rgba(230, 244, 255, 0.92)',
} satisfies CSSProperties
const snapshotPreviewNodeContainerStyle = {
  borderStyle: 'dashed',
  borderColor: '#d9d9d9',
  background: 'rgba(250, 250, 250, 0.28)',
} satisfies CSSProperties
const snapshotPreviewNodeTextStyle = {
  border: 'none',
  borderRadius: 0,
  padding: 0,
  background: 'transparent',
} satisfies CSSProperties
const snapshotPreviewNodeLabelStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  fontWeight: 500,
} satisfies CSSProperties
const snapshotPreviewNodeMetaStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  color: '#8c8c8c',
} satisfies CSSProperties
const snapshotPreviewFields = [
  'id',
  'parentId',
  'type',
  'text',
  'role',
  'visible',
  'enabled',
  'clickable',
  'value',
  'bounds',
].join(',')
const triStateOptions = [
  { label: 'true', value: 'true' },
  { label: 'false', value: 'false' },
]
const stateScopeOptions = [
  { label: 'app', value: 'app' },
  { label: 'target', value: 'target' },
  { label: 'branch', value: 'branch' },
]
const snapshotScopeOptions = [
  { label: 'self', value: 'self' },
  { label: 'branchToRoot', value: 'branchToRoot' },
  { label: 'subtree', value: 'subtree' },
]

function buildActionKey(targetId: string, action: string) {
  return `${targetId}::${action}`
}

function toResponsiveWidth(width?: number | string) {
  if (typeof width === 'number') {
    return `min(100%, ${width}px)`
  }
  return width
}

function normalizeAPIBaseURL(value?: string) {
  return (value || '').trim().replace(/\/+$/, '')
}

function readInitialAPIBaseURL() {
  if (typeof window === 'undefined') {
    return ''
  }
  return normalizeAPIBaseURL(window.localStorage.getItem(apiBaseURLStorageKey) || '')
}

function toOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => !!value)))
    .map((value) => ({
      label: value,
      value,
    }))
}

function renderJson(value: unknown, maxHeight = 280) {
  return <JsonPreviewer value={value ?? {}} maxHeight={maxHeight} />
}

const JsonInfoButton: FC<{
  title: string
  value: unknown
  maxHeight?: number
}> = ({
  title,
  value,
  maxHeight = 320,
}) => {
  return (
    <Popover
      trigger="click"
      placement="leftTop"
      title={title}
      content={(
        <div style={{ width: 420, maxWidth: '70vw' }}>
          {renderJson(value, maxHeight)}
        </div>
      )}
    >
      <Button
        size="small"
        type="text"
        icon={<InfoCircleOutlined />}
      />
    </Popover>
  )
}

const LabeledField: FC<{
  name: FormItemProps['name']
  label: string
  width?: number | string
  rules?: FormItemProps['rules']
  children: ReactNode
}> = ({
  name,
  label,
  width,
  rules,
  children,
}) => {
  const controlWidth = toResponsiveWidth(width)
  const control = controlWidth && isValidElement<{ style?: CSSProperties }>(children)
    ? cloneElement(children, {
      style: {
        ...children.props.style,
        width: controlWidth,
      },
    })
    : children

  return (
    <div style={{ maxWidth: '100%' }}>
      <Form.Item style={{ marginBottom: 0 }}>
        <FloatLabel label={label} size="small">
          <Form.Item name={name} noStyle rules={rules}>
            {control}
          </Form.Item>
        </FloatLabel>
      </Form.Item>
    </div>
  )
}

const logColumns: ColumnsType<LogEntry> = [
  { title: 'seq', dataIndex: 'seq', width: 80 },
  { title: 'time', dataIndex: 'time', width: 170 },
  { title: 'source', dataIndex: 'source', width: 120 },
  { title: 'level', dataIndex: 'level', width: 100 },
  { title: 'event', dataIndex: 'event', width: 140 },
  { title: 'targetId', dataIndex: 'targetId', width: 160, render: (value) => value || '-' },
  { title: 'summary', dataIndex: 'summary' },
  {
    title: 'data',
    dataIndex: 'data',
    width: 260,
    render: (value) => <JsonPreviewer value={value || {}} maxHeight={160} />,
  },
]

function normalizeSnapshotQuery(values?: Record<string, unknown>) {
  const next: Record<string, unknown> = { ...(values || {}) }
  next.fields = snapshotPreviewFields
  if (next.limit === undefined || next.limit === null || next.limit === '') {
    next.limit = 200
  }
  return next
}

function toSnapshotPreviewNodes(snapshot: SnapshotResponse | null): SnapshotPreviewNode[] {
  return (snapshot?.nodes || [])
    .filter((node): node is SnapshotPreviewNode => {
      return !!node.bounds
        && node.visible !== false
        && node.bounds.width > 0
        && node.bounds.height > 0
    })
    .sort((left, right) => {
      return (right.bounds.width * right.bounds.height) - (left.bounds.width * left.bounds.height)
    })
}

function buildSnapshotTree(snapshot: SnapshotResponse | null): SnapshotTreeNode[] {
  const nodes = snapshot?.nodes || []
  const byParent = nodes.reduce<Record<string, SnapshotResponse['nodes']>>((result, node) => {
    const parentKey = node.parentId || '__root__'
    const current = result[parentKey] || []
    current.push(node)
    result[parentKey] = current
    return result
  }, {})

  const sortNodes = (items: NonNullable<SnapshotResponse['nodes']>) => {
    return [...items].sort((left, right) => {
      const topDiff = (left.bounds?.top || 0) - (right.bounds?.top || 0)
      if (topDiff !== 0) {
        return topDiff
      }
      return (left.bounds?.left || 0) - (right.bounds?.left || 0)
    })
  }

  const toTreeNode = (node: NonNullable<SnapshotResponse['nodes']>[number]): SnapshotTreeNode => {
    const children = sortNodes(byParent[node.id] || []).map(toTreeNode)

    return {
      id: node.id,
      kind: node.type || node.role || 'Node',
      label: node.text || node.value || '',
      clickable: !!node.clickable,
      children,
    }
  }

  return sortNodes(byParent.__root__ || []).map(toTreeNode)
}

const SnapshotPreview: FC<{ snapshot: SnapshotResponse | null }> = ({ snapshot }) => {
  const nodes = toSnapshotPreviewNodes(snapshot)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(snapshotPreviewFallbackWidth)

  useEffect(() => {
    const element = shellRef.current
    if (!element) {
      return
    }

    const updateWidth = () => {
      setCanvasWidth(Math.max(420, Math.floor(element.clientWidth - 2)))
    }

    updateWidth()

    const observer = new ResizeObserver(() => {
      updateWidth()
    })
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  if (!nodes.length) {
    return <Text type="secondary">no bounded nodes，先点 Query Snapshot</Text>
  }

  const minLeft = Math.min(...nodes.map((item) => item.bounds.left))
  const minTop = Math.min(...nodes.map((item) => item.bounds.top))
  const maxRight = Math.max(...nodes.map((item) => item.bounds.left + item.bounds.width))
  const maxBottom = Math.max(...nodes.map((item) => item.bounds.top + item.bounds.height))
  const width = Math.max(1, maxRight - minLeft)
  const height = Math.max(1, maxBottom - minTop)
  const scale = canvasWidth / width
  const canvasHeight = Math.max(220, Math.ceil(height * scale))

  return (
    <div ref={shellRef} style={snapshotPreviewShellStyle}>
      <div style={snapshotPreviewBarStyle}>
        <Text type="secondary">
          {(snapshot?.screen || snapshot?.summary?.screen || 'Unknown')} · {nodes.length} nodes
        </Text>
      </div>
      <div style={{ ...snapshotPreviewCanvasStyle, height: canvasHeight }}>
        {nodes.map((node) => {
          const label = node.text || node.value || node.id
          const typeLabel = node.type || node.role || 'Node'
          const kind = (node.role || node.type || '').toLowerCase()
          const isTextLike = kind === 'text' || kind === 'label'
          const isContainer = kind === 'container' || kind === 'panel'
          const scaledWidth = node.bounds.width * scale
          const scaledHeight = node.bounds.height * scale
          const showLabel = scaledWidth >= 18 && scaledHeight >= 8
          const fontSize = Math.max(7, Math.min(14, Math.floor(scaledHeight * 0.5)))

          return (
            <div
              key={node.id}
              style={{
                ...snapshotPreviewNodeBaseStyle,
                ...(node.clickable ? snapshotPreviewNodeClickableStyle : {}),
                ...(isContainer ? snapshotPreviewNodeContainerStyle : {}),
                ...(isTextLike ? snapshotPreviewNodeTextStyle : {}),
                left: (node.bounds.left - minLeft) * scale,
                top: (node.bounds.top - minTop) * scale,
                width: Math.max(scaledWidth, 12),
                height: Math.max(scaledHeight, 10),
                fontSize,
              }}
              title={`${node.id} / ${typeLabel}${label ? ` / ${label}` : ''}`}
            >
              {showLabel ? (
                <>
                  {!isContainer ? <div style={snapshotPreviewNodeLabelStyle}>{label}</div> : null}
                  {!isTextLike && !isContainer ? <div style={snapshotPreviewNodeMetaStyle}>{typeLabel}</div> : null}
                </>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SnapshotTreeView: FC<{ snapshot: SnapshotResponse | null }> = ({ snapshot }) => {
  const treeData = buildSnapshotTree(snapshot)

  if (!treeData.length) {
    return <Text type="secondary">no snapshot tree</Text>
  }

  const toAntdTreeNode = (node: SnapshotTreeNode): DataNode => {
    return {
      key: node.id,
      title: (
        <Space size={4} wrap>
          <Text code>{node.kind}</Text>
          <Text code>{`id=${node.id}`}</Text>
          {node.label ? <Text type="secondary">{node.label}</Text> : null}
          {node.clickable ? <Tag color="blue">clickable</Tag> : null}
        </Space>
      ),
      children: node.children.map(toAntdTreeNode),
    }
  }

  return (
    <Tree
      blockNode
      defaultExpandAll
      height={420}
      selectable={false}
      showLine
      style={{ minWidth: 'max-content' }}
      treeData={treeData.map(toAntdTreeNode)}
    />
  )
}

const App: FC = () => {
  const { message } = AntdApp.useApp()

  const [apiBaseURL, setApiBaseURL] = useState(readInitialAPIBaseURL)
  const [apiBaseURLInput, setApiBaseURLInput] = useState(readInitialAPIBaseURL)
  const [meta, setMeta] = useState<MetaResponse | null>(null)
  const [help, setHelp] = useState<HelpResponse | null>(null)
  const [actions, setActions] = useState<ActionCatalogResponse | null>(null)
  const [logs, setLogs] = useState<LogsResponse | null>(null)
  const [stateData, setStateData] = useState<StateResponse | null>(null)
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null)
  const [actionResult, setActionResult] = useState<ActionResponse | LogsClearResponse | null>(null)

  const [actionQueryForm] = Form.useForm()
  const [manualActionForm] = Form.useForm()
  const [logsForm] = Form.useForm()
  const [stateForm] = Form.useForm()
  const [snapshotForm] = Form.useForm()
  const actionQueryTargetId = Form.useWatch('targetId', actionQueryForm)
  const actionQueryAction = Form.useWatch('action', actionQueryForm)
  const manualActionTargetId = Form.useWatch('targetId', manualActionForm)
  const manualActionAction = Form.useWatch('action', manualActionForm)

  const actionTargetIdOptions = toOptions([
    ...(actions?.items || []).map((item) => item.targetId),
    ...(stateData?.summary?.targetStateTargets || []),
  ])
  // 直接吃后端 catalog.args，避免上游扩 action 参数时 web 还要手写一份 schema。
  const actionDescriptors = (actions?.items || []).flatMap<ActionDescriptorView>((item) => {
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
    result[item.targetId] = item.actions.map((action) => action.name)
    return result
  }, {})
  const actionNameOptions = toOptions(
    (actions?.items || []).flatMap((item) => item.actions.map((action) => action.name))
  )
  const actionQueryActionOptions = actionQueryTargetId
    ? toOptions(actionsByTargetId[actionQueryTargetId] || [])
    : actionNameOptions
  const manualActionOptions = manualActionTargetId
    ? toOptions(actionsByTargetId[manualActionTargetId] || [])
    : actionNameOptions
  const selectedManualActionDescriptor = manualActionTargetId && manualActionAction
    ? actionDescriptorByKey[buildActionKey(manualActionTargetId, manualActionAction)]
    : undefined
  const manualActionArgNames = (selectedManualActionDescriptor?.args || []).filter((name) => name !== 'text')
  const consoleTitle = help?.consoleTitle || 'Freewind Debug Console'
  const screenOptions = toOptions([
    help?.screenName,
    snapshot?.screen,
    snapshot?.summary?.screen,
    ...(actions?.items || []).map((item) => item.screen),
    ...(logs?.items || []).map((item) => item.data?.screen),
  ])
  const logEventOptions = toOptions([
    ...Object.keys(logs?.summary?.eventCountsTop || {}),
    ...(logs?.items || []).map((item) => item.event),
  ])
  const logLevelOptions = toOptions([
    ...Object.keys(logs?.summary?.levelCounts || {}),
    ...(logs?.items || []).map((item) => item.level),
  ])
  const logSourceOptions = toOptions([
    ...Object.keys(logs?.summary?.sourceCounts || {}),
    ...(logs?.items || []).map((item) => item.source),
  ])
  const logTargetIdOptions = toOptions([
    ...(logs?.items || []).map((item) => item.targetId),
    ...(actions?.items || []).map((item) => item.targetId),
  ])
  const stateKeyOptions = toOptions(
    (stateData?.summary?.appStateKeys || []).map((item) => item.key)
  )
  const stateTargetIdOptions = toOptions([
    ...(stateData?.summary?.targetStateTargets || []),
    ...(actions?.items || []).map((item) => item.targetId),
  ])
  const snapshotTargetIdOptions = toOptions([
    ...(snapshot?.nodes || []).map((item) => item.id),
    ...(actions?.items || []).map((item) => item.targetId),
  ])
  const snapshotTypeOptions = toOptions(
    (snapshot?.nodes || []).map((item) => item.type)
  )
  const apiBaseURLLabel = apiBaseURL || 'not set'
  const headerAppName = meta?.appName || 'No API Connected'
  const headerBuildVersion = meta?.buildVersion
  const headerStatus = help ? `${help.screenName} / ${help.serverTime}` : (apiBaseURL ? 'connecting...' : 'fill API base URL')

  function requestJSON<T>(path: string, init?: RequestInit) {
    if (!apiBaseURL) {
      throw new Error('请先填写 API base URL')
    }
    return fetchJSON<T>(path, { ...init, baseURL: apiBaseURL })
  }

  function clearRemoteData() {
    setMeta(null)
    setHelp(null)
    setActions(null)
    setLogs(null)
    setStateData(null)
    setSnapshot(null)
    setActionResult(null)
  }

  const actionColumns: ColumnsType<ActionCatalogResponse['items'][number]> = [
    {
      title: 'targetId',
      dataIndex: 'targetId',
      width: 180,
      render: (value) => <Text strong>{value}</Text>,
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
            <Space size={4} key={`${item.targetId}-${action.name}`} wrap>
              <Button
                size="small"
                onClick={() => {
                  if (action.args.length) {
                    hydrateManualAction(item.targetId, action.name)
                    message.info(`filled ${item.targetId} ${action.name}`)
                    return
                  }
                  void runAction(action.example)
                }}
              >
                {action.args.length ? `Fill ${action.name}` : action.name}
              </Button>
              {action.args.map((argName) => (
                <Tag key={`${item.targetId}-${action.name}-${argName}`} color={argName === 'text' ? 'gold' : 'default'}>
                  {argName}
                </Tag>
              ))}
            </Space>
          ))}
        </Space>
      ),
    },
  ]

  function hydrateManualAction(targetId: string, action: string) {
    const descriptor = actionDescriptorByKey[buildActionKey(targetId, action)]
    if (!descriptor) {
      manualActionForm.setFieldsValue({
        targetId,
        action,
      })
      return
    }

    const argValues = descriptor.args.reduce<Record<string, string>>((result, argName) => {
      if (argName === 'text') {
        return result
      }
      result[argName] = descriptor.example.args?.[argName] ?? ''
      return result
    }, {})

    manualActionForm.setFieldsValue({
      targetId,
      action,
      text: descriptor.args.includes('text') ? (descriptor.example.text ?? undefined) : undefined,
      dx: descriptor.example.dx ?? undefined,
      dy: descriptor.example.dy ?? undefined,
      argValues,
    })
  }

  async function loadMeta() {
    const result = await requestJSON<MetaResponse>('/meta')
    setMeta(result)
    return result
  }

  async function loadHelp() {
    const result = await requestJSON<HelpResponse>('/help')
    setHelp(result)
    return result
  }

  async function loadActions(values?: Record<string, unknown>) {
    const formValues = values ?? actionQueryForm.getFieldsValue()
    const result = await requestJSON<ActionCatalogResponse>(`/action${buildQuery(formValues)}`)
    setActions(result)
    return result
  }

  async function loadLogs(values?: Record<string, unknown>) {
    const formValues = values ?? logsForm.getFieldsValue()
    const result = await requestJSON<LogsResponse>(`/logs${buildQuery(formValues)}`)
    setLogs(result)
    return result
  }

  async function loadState(values?: Record<string, unknown>) {
    const formValues = values ?? stateForm.getFieldsValue()
    const result = await requestJSON<StateResponse>(`/state${buildQuery(formValues)}`)
    setStateData(result)
    return result
  }

  async function loadSnapshot(values?: Record<string, unknown>) {
    const formValues = normalizeSnapshotQuery(values ?? snapshotForm.getFieldsValue())
    const result = await requestJSON<SnapshotResponse>(`/snapshot${buildQuery(formValues)}`)
    setSnapshot(result)
    return result
  }

  async function loadSnapshotSummary() {
    const result = await requestJSON<SnapshotResponse>('/snapshot')
    setSnapshot(result)
    return result
  }

  async function refreshAll() {
    if (!apiBaseURL) {
      clearRemoteData()
      return
    }
    try {
      await Promise.all([
        loadMeta(),
        loadHelp(),
        loadActions({}),
        loadLogs({}),
        loadState({}),
        loadSnapshot(),
      ])
    } catch (error) {
      message.error(String((error as Error).message || error))
    }
  }

  async function applyAPIBaseURL(nextValue?: string) {
    try {
      const normalizedValue = normalizeAPIBaseURL(nextValue ?? apiBaseURLInput)
      if (normalizedValue) {
        const parsed = new URL(normalizedValue)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('API base URL must start with http:// or https://')
        }
      }
      setApiBaseURL(normalizedValue)
      setApiBaseURLInput(normalizedValue)
      window.localStorage.setItem(apiBaseURLStorageKey, normalizedValue)
      if (!normalizedValue) {
        clearRemoteData()
        return
      }
      await refreshAllWithBaseURL(normalizedValue)
    } catch (error) {
      message.error(String((error as Error).message || error))
    }
  }

  async function refreshAllWithBaseURL(baseURL: string) {
    if (!baseURL) {
      clearRemoteData()
      return
    }
    try {
      await Promise.all([
        fetchJSON<MetaResponse>('/meta', { baseURL }),
        fetchJSON<HelpResponse>('/help', { baseURL }),
        fetchJSON<ActionCatalogResponse>('/action', { baseURL }),
        fetchJSON<LogsResponse>(`/logs${buildQuery({})}`, { baseURL }),
        fetchJSON<StateResponse>(`/state${buildQuery({})}`, { baseURL }),
        fetchJSON<SnapshotResponse>(`/snapshot${buildQuery(normalizeSnapshotQuery(snapshotForm.getFieldsValue()))}`, { baseURL }),
      ]).then(([nextMeta, nextHelp, nextActions, nextLogs, nextStateData, nextSnapshot]) => {
        setMeta(nextMeta)
        setHelp(nextHelp)
        setActions(nextActions)
        setLogs(nextLogs)
        setStateData(nextStateData)
        setSnapshot(nextSnapshot)
      })
    } catch (error) {
      message.error(String((error as Error).message || error))
    }
  }

  async function runAction(payload: ActionRequest) {
    try {
      const result = await requestJSON<ActionResponse>('/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setActionResult(result)
      message.success(result.message)
      await Promise.all([loadHelp(), loadLogs({}), loadState({}), loadSnapshot()])
    } catch (error) {
      message.error(String((error as Error).message || error))
    }
  }

  async function runManualAction() {
    try {
      const values = await manualActionForm.validateFields() as ManualActionFormValues
      const args = Object.entries(values.argValues || {}).reduce<Record<string, string>>((result, [key, rawValue]) => {
        const value = rawValue.trim()
        if (!value) {
          return result
        }
        result[key] = value
        return result
      }, {})
      await runAction({
        action: values.action || '',
        targetId: values.targetId || '',
        text: values.text?.trim() || undefined,
        dx: values.dx ?? undefined,
        dy: values.dy ?? undefined,
        source: values.source?.trim() || undefined,
        args: Object.keys(args).length ? args : undefined,
      })
    } catch (error) {
      message.error(String((error as Error).message || error))
    }
  }

  async function clearLogs() {
    try {
      const result = await requestJSON<LogsClearResponse>('/logs', { method: 'DELETE' })
      setActionResult(result)
      message.success(result.message)
      await Promise.all([loadHelp(), loadLogs({})])
    } catch (error) {
      message.error(String((error as Error).message || error))
    }
  }

  useEffect(() => {
    actionQueryForm.setFieldsValue({})
    manualActionForm.setFieldsValue({ source: 'human', argValues: {} })
    logsForm.setFieldsValue({ limit: 20 })
    stateForm.setFieldsValue({})
    snapshotForm.setFieldsValue({ limit: 200, types: [] })
    if (readInitialAPIBaseURL()) {
      void refreshAll()
    }
  }, [])

  useEffect(() => {
    document.title = meta?.appName ? `${meta.appName} Debug Console` : consoleTitle
  }, [consoleTitle, meta?.appName])

  useEffect(() => {
    if (!actionQueryAction) {
      return
    }
    const matched = actionQueryActionOptions.some((item) => item.value === actionQueryAction)
    if (!matched) {
      actionQueryForm.setFieldValue('action', undefined)
    }
  }, [actionQueryAction, actionQueryActionOptions, actionQueryForm])

  useEffect(() => {
    if (!manualActionAction) {
      return
    }
    const matched = manualActionOptions.some((item) => item.value === manualActionAction)
    if (!matched) {
      manualActionForm.setFieldValue('action', undefined)
    }
  }, [manualActionAction, manualActionForm, manualActionOptions])

  return (
    <Layout>
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '8px 16px',
          height: 'auto',
          lineHeight: 1.2,
        }}
      >
        <Flex justify="space-between" align="center" gap={12} wrap>
          <Space direction="vertical" size={2}>
            <Title level={4} style={{ margin: 0, lineHeight: '32px', paddingTop: 6 }}>
              {consoleTitle}
            </Title>
            <Space size={8} wrap>
              <Text strong style={{ fontSize: 16 }}>{headerAppName}</Text>
              {headerBuildVersion !== undefined ? <Tag color="blue" style={{ fontWeight: 600 }}>{`v${headerBuildVersion}`}</Tag> : null}
              <Text type="secondary">{headerStatus}</Text>
            </Space>
          </Space>
          <Space size={8} wrap style={{ width: 'min(100%, 520px)', justifyContent: 'flex-end' }}>
            <Text type="secondary">{`API ${apiBaseURLLabel}`}</Text>
            <Input
              size="small"
              value={apiBaseURLInput}
              placeholder="http://127.0.0.1:9001"
              style={{ width: 'min(100%, 360px)' }}
              onChange={(event) => setApiBaseURLInput(event.target.value)}
              onPressEnter={() => void applyAPIBaseURL()}
            />
            <Button size="small" type="primary" onClick={() => void applyAPIBaseURL()}>
              Apply
            </Button>
          </Space>
        </Flex>
      </Header>
      <Content style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ display: 'flex' }}>
          <Card size="small">
            <Space size={8} wrap>
              <Button size="small" type="primary" onClick={() => void refreshAll()}>
                Refresh All
              </Button>
              <Button size="small" onClick={() => void loadActions({})}>Refresh Actions</Button>
              <Button size="small" danger onClick={() => void clearLogs()}>
                Clear Logs
              </Button>
            </Space>
          </Card>

          <Flex gap={8} wrap>
            <Card size="small" style={{ flex: '1 1 160px', minWidth: 150 }}><Statistic title="Action Targets" value={help?.counts.actionTargetCount ?? 0} /></Card>
            <Card size="small" style={{ flex: '1 1 160px', minWidth: 150 }}><Statistic title="Logs" value={help?.counts.logCount ?? 0} /></Card>
            <Card size="small" style={{ flex: '1 1 160px', minWidth: 150 }}><Statistic title="State Keys" value={help?.counts.stateKeyCount ?? 0} /></Card>
            <Card size="small" style={{ flex: '1 1 160px', minWidth: 150 }}><Statistic title="Snapshot Nodes" value={help?.counts.snapshotNodeCount ?? 0} /></Card>
          </Flex>

          <Tabs
            size="small"
            items={[
              {
                key: 'logs',
                label: 'Logs',
                children: (
                  <Space direction="vertical" size={8} style={{ display: 'flex' }}>
                    <Card size="small" title="Query">
                      <Form form={logsForm} layout="vertical" size="small">
                        <Flex vertical gap="small">
                          <Flex gap="small" wrap>
                            <LabeledField name="event" label="event" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={logEventOptions} /></LabeledField>
                            <LabeledField name="level" label="level" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={logLevelOptions} /></LabeledField>
                            <LabeledField name="source" label="source" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={logSourceOptions} /></LabeledField>
                            <LabeledField name="targetId" label="targetId" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={logTargetIdOptions} /></LabeledField>
                            <LabeledField name="screen" label="screen" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={screenOptions} /></LabeledField>
                            <LabeledField name="from" label="from" width={queryFieldWidth}><Input size="small" /></LabeledField>
                            <LabeledField name="to" label="to" width={queryFieldWidth}><Input size="small" /></LabeledField>
                            <LabeledField name="limit" label="limit" width={queryFieldNumberWidth}><InputNumber size="small" /></LabeledField>
                            <LabeledField name="keyword" label="keyword" width={queryFieldWidth}><Input size="small" /></LabeledField>
                          </Flex>
                          <Space size={8} wrap>
                            <Button size="small" type="primary" onClick={() => void loadLogs()}>Query Logs</Button>
                            <Button size="small" onClick={() => void loadLogs({})}>Summary</Button>
                            <Button size="small" danger onClick={() => void clearLogs()}>Delete Logs</Button>
                          </Space>
                        </Flex>
                      </Form>
                    </Card>

                    <Card
                      size="small"
                      title="Table"
                      extra={<JsonInfoButton title="Logs JSON" value={logs} />}
                    >
                      <Table
                        size="small"
                        rowKey="seq"
                        columns={logColumns}
                        dataSource={logs?.items || []}
                        pagination={false}
                        scroll={{ x: 1200 }}
                      />
                    </Card>
                  </Space>
                ),
              },
              {
                key: 'action',
                label: 'Action',
                children: (
                  <Space direction="vertical" size={8} style={{ display: 'flex' }}>
                    <Card size="small" title="Query">
                      <Form form={actionQueryForm} layout="vertical" size="small">
                        <Flex vertical gap="small">
                          <Flex gap="small" wrap>
                            <LabeledField name="targetId" label="targetId" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={actionTargetIdOptions} /></LabeledField>
                            <LabeledField name="action" label="action" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={actionQueryActionOptions} /></LabeledField>
                            <LabeledField name="screen" label="screen" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={screenOptions} /></LabeledField>
                          </Flex>
                          <Button size="small" type="primary" onClick={() => void loadActions()}>Load Actions</Button>
                        </Flex>
                      </Form>
                    </Card>

                    <Card
                      size="small"
                      title="Action Table"
                      extra={<JsonInfoButton title="Action Catalog JSON" value={actions} />}
                    >
                      <Table
                        size="small"
                        rowKey="targetId"
                        columns={actionColumns}
                        dataSource={actions?.items || []}
                        pagination={false}
                        scroll={{ x: 760 }}
                      />
                    </Card>

                    <Card size="small" title="Manual Action">
                      <Form form={manualActionForm} layout="vertical" size="small">
                        <Flex vertical gap="small">
                          {selectedManualActionDescriptor ? (
                            <Space size={4} wrap>
                              <Text type="secondary">{selectedManualActionDescriptor.summary}</Text>
                              {selectedManualActionDescriptor.args.length
                                ? selectedManualActionDescriptor.args.map((argName) => (
                                  <Tag key={`manual-${argName}`} color={argName === 'text' ? 'gold' : 'default'}>
                                    {argName}
                                  </Tag>
                                ))
                                : <Tag color="green">no args</Tag>}
                            </Space>
                          ) : null}
                          <Flex gap="small" wrap>
                            <LabeledField name="targetId" label="targetId" width={queryFieldWidth} rules={[{ required: true }]}><Select {...commonSelectProps} options={actionTargetIdOptions} onChange={(value) => manualActionForm.setFieldsValue({ targetId: value, action: undefined, text: undefined, dx: undefined, dy: undefined, argValues: {} })} /></LabeledField>
                            <LabeledField name="action" label="action" width={queryFieldWidth} rules={[{ required: true }]}><Select {...commonSelectProps} options={manualActionOptions} onChange={(value) => value && manualActionTargetId ? hydrateManualAction(manualActionTargetId, value) : manualActionForm.setFieldValue('action', value)} /></LabeledField>
                            <LabeledField name="source" label="source" width={queryFieldWidth}><Input size="small" /></LabeledField>
                            <LabeledField name="text" label="text" width={queryFieldWidth}><Input size="small" /></LabeledField>
                            <LabeledField name="dx" label="dx" width={queryFieldNumberWidth}><InputNumber size="small" /></LabeledField>
                            <LabeledField name="dy" label="dy" width={queryFieldNumberWidth}><InputNumber size="small" /></LabeledField>
                          </Flex>
                          {manualActionArgNames.length ? (
                            <Flex gap="small" wrap>
                              {manualActionArgNames.map((argName) => (
                                <LabeledField key={argName} name={['argValues', argName]} label={argName} width={queryFieldWidth}>
                                  <Input size="small" />
                                </LabeledField>
                              ))}
                            </Flex>
                          ) : null}
                          <Space size={8}>
                            <Button size="small" type="primary" onClick={() => void runManualAction()}>Send Action</Button>
                          </Space>
                        </Flex>
                      </Form>
                    </Card>

                    <Card size="small" title="Latest Result">
                      {renderJson(actionResult)}
                    </Card>
                  </Space>
                ),
              },
              {
                key: 'state',
                label: 'State',
                children: (
                  <Space direction="vertical" size={8} style={{ display: 'flex' }}>
                    <Card size="small" title="Query">
                      <Form form={stateForm} layout="vertical" size="small">
                        <Flex vertical gap="small">
                          <Flex gap="small" wrap>
                            <LabeledField name="keys" label="keys" width={queryFieldWideWidth}><Select {...commonSelectProps} mode="multiple" allowClear options={stateKeyOptions} /></LabeledField>
                            <LabeledField name="targetId" label="targetId" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={stateTargetIdOptions} /></LabeledField>
                            <LabeledField name="scope" label="scope" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={stateScopeOptions} /></LabeledField>
                          </Flex>
                          <Space size={8}>
                            <Button size="small" type="primary" onClick={() => void loadState()}>Query State</Button>
                            <Button size="small" onClick={() => void loadState({})}>Summary</Button>
                          </Space>
                        </Flex>
                      </Form>
                    </Card>

                    <Card size="small" title="JSON">
                      {renderJson(stateData)}
                    </Card>
                  </Space>
                ),
              },
              {
                key: 'snapshot',
                label: 'Snapshot',
                children: (
                  <Space direction="vertical" size={8} style={{ display: 'flex' }}>
                    <Card size="small" title="Query">
                      <Form form={snapshotForm} layout="vertical" size="small">
                        <Flex vertical gap="small">
                          <Flex gap="small" wrap>
                            <LabeledField name="targetId" label="targetId" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={snapshotTargetIdOptions} /></LabeledField>
                            <LabeledField name="scope" label="scope" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={snapshotScopeOptions} /></LabeledField>
                            <LabeledField name="depth" label="depth" width={queryFieldNumberWidth}><InputNumber size="small" /></LabeledField>
                            <LabeledField name="types" label="types" width={queryFieldWideWidth}><Select {...commonSelectProps} mode="multiple" allowClear options={snapshotTypeOptions} /></LabeledField>
                            <LabeledField name="textKeyword" label="textKeyword" width={queryFieldWidth}><Input size="small" /></LabeledField>
                            <LabeledField name="visible" label="visible" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={triStateOptions} /></LabeledField>
                            <LabeledField name="enabled" label="enabled" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={triStateOptions} /></LabeledField>
                            <LabeledField name="clickable" label="clickable" width={queryFieldWidth}><Select {...commonSelectProps} allowClear options={triStateOptions} /></LabeledField>
                            <LabeledField name="limit" label="limit" width={queryFieldNumberWidth}><InputNumber size="small" /></LabeledField>
                          </Flex>
                          <Space size={8}>
                            <Button size="small" type="primary" onClick={() => void loadSnapshot()}>Query Snapshot</Button>
                            <Button size="small" onClick={() => void loadSnapshotSummary()}>Summary</Button>
                          </Space>
                        </Flex>
                      </Form>
                    </Card>

                    <Flex gap={8} wrap align="start">
                      <Card
                        size="small"
                        title="Preview"
                        extra={<JsonInfoButton title="Snapshot JSON" value={snapshot} maxHeight={360} />}
                        style={{ flex: '1 1 520px', minWidth: 320 }}
                      >
                        <SnapshotPreview snapshot={snapshot} />
                      </Card>

                      <Card
                        size="small"
                        title="Tree"
                        style={{ flex: '1 1 420px', minWidth: 320 }}
                      >
                        <SnapshotTreeView snapshot={snapshot} />
                      </Card>
                    </Flex>
                  </Space>
                ),
              },
              {
                key: 'help',
                label: 'Help',
                children: (
                  <Space direction="vertical" size={8} style={{ display: 'flex' }}>
                    <Card size="small" title="JSON">
                      {renderJson(help)}
                    </Card>
                  </Space>
                ),
              },
            ]}
          />
          <Divider />
          <Text type="secondary">Standalone console for Android / Swift debug bridge.</Text>
        </Space>
      </Content>
    </Layout>
  )
}

export default App
