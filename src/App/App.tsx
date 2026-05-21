import { useTitle } from 'ahooks'
import { App as AntdApp, Divider, Form, Layout, Space, Tabs, Typography } from 'antd'
import {
  APIHeader,
  ActionTab,
  HelpTab,
  LogsTab,
  OverviewStats,
  RefreshToolbar,
  SnapshotTab,
  StateTab,
} from './components'
import { useDebugBridgeRequests } from '../hooks'
import { buildActionKey } from '../utils/buildActionKey'
import { toOptions } from '../utils/toOptions'
import type { ManualActionFormValues } from './types'

export function App() {
  const { message } = AntdApp.useApp()
  const [actionQueryForm] = Form.useForm()
  const [manualActionForm] = Form.useForm()
  const [logsForm] = Form.useForm()
  const [stateForm] = Form.useForm()
  const [snapshotForm] = Form.useForm()
  const actionQueryTargetId = Form.useWatch('targetId', actionQueryForm)
  const manualActionTargetId = Form.useWatch('targetId', manualActionForm)
  const manualActionAction = Form.useWatch('action', manualActionForm)

  const {
    actionResult,
    actions,
    apiBaseURL,
    apiBaseURLInput,
    applyAPIBaseURL,
    clearLogs,
    help,
    loadActions,
    loadLogs,
    loadSnapshot,
    loadSnapshotSummary,
    loadState,
    logs,
    meta,
    refreshAll,
    runAction,
    setApiBaseURLInput,
    snapshot,
    stateData,
  } = useDebugBridgeRequests({
    actionQueryForm,
    logsForm,
    manualActionForm,
    message,
    snapshotForm,
    stateForm,
  })

  const actionTargetIdOptions = toOptions([
    ...(actions?.items || []).map((item) => item.targetId),
    ...(stateData?.summary?.targetStateTargets || []),
  ])
  const actionDescriptors = (actions?.items || []).flatMap((item) => {
    return item.actions.map((action) => ({
      ...action,
      targetId: item.targetId,
      targetType: item.targetType,
      screen: item.screen,
    }))
  })
  const actionDescriptorByKey = actionDescriptors.reduce<Record<string, (typeof actionDescriptors)[number]>>(
    (result, item) => {
      result[buildActionKey(item.targetId, item.name)] = item
      return result
    },
    {},
  )
  const actionsByTargetId = (actions?.items || []).reduce<Record<string, string[]>>(
    (result, item) => {
      result[item.targetId] = item.actions.map((action) => action.name)
      return result
    },
    {},
  )
  const actionNameOptions = toOptions(
    (actions?.items || []).flatMap((item) => item.actions.map((action) => action.name)),
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
  const manualActionArgNames = (selectedManualActionDescriptor?.args || []).filter(
    (name) => name !== 'text',
  )
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
    (stateData?.summary?.appStateKeys || []).map((item) => item.key),
  )
  const stateTargetIdOptions = toOptions([
    ...(stateData?.summary?.targetStateTargets || []),
    ...(actions?.items || []).map((item) => item.targetId),
  ])
  const snapshotTargetIdOptions = toOptions([
    ...(snapshot?.nodes || []).map((item) => item.id),
    ...(actions?.items || []).map((item) => item.targetId),
  ])
  const snapshotTypeOptions = toOptions((snapshot?.nodes || []).map((item) => item.type))
  const apiBaseURLLabel = apiBaseURL || 'not set'
  const headerAppName = meta?.appName || 'No API Connected'
  const headerBuildVersion = meta?.buildVersion
  const headerStatus = help
    ? `${help.screenName} / ${help.serverTime}`
    : apiBaseURL
      ? 'connecting...'
      : 'fill API base URL'

  useTitle(meta?.appName ? `${meta.appName} Debug Console` : consoleTitle)

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
      text: descriptor.args.includes('text') ? descriptor.example.text ?? undefined : undefined,
      dx: descriptor.example.dx ?? undefined,
      dy: descriptor.example.dy ?? undefined,
      argValues,
    })
  }

  function fillManualAction(targetId: string, action: string) {
    hydrateManualAction(targetId, action)
    message.info(`filled ${targetId} ${action}`)
  }

  async function runManualAction() {
    const values = (await manualActionForm.validateFields()) as ManualActionFormValues
    const args = Object.entries(values.argValues || {}).reduce<Record<string, string>>(
      (result, [key, rawValue]) => {
        const value = rawValue.trim()
        if (!value) {
          return result
        }
        result[key] = value
        return result
      },
      {},
    )

    return runAction({
      action: values.action || '',
      targetId: values.targetId || '',
      text: values.text?.trim() || undefined,
      dx: values.dx ?? undefined,
      dy: values.dy ?? undefined,
      source: values.source?.trim() || undefined,
      args: Object.keys(args).length ? args : undefined,
    })
  }

  return (
    <Layout>
      <APIHeader
        apiBaseURLInput={apiBaseURLInput}
        apiBaseURLLabel={apiBaseURLLabel}
        applyAPIBaseURL={applyAPIBaseURL}
        consoleTitle={consoleTitle}
        headerAppName={headerAppName}
        headerBuildVersion={headerBuildVersion}
        headerStatus={headerStatus}
        setApiBaseURLInput={setApiBaseURLInput}
      />
      <Layout.Content style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ display: 'flex' }}>
          <RefreshToolbar clearLogs={clearLogs} loadActions={loadActions} refreshAll={refreshAll} />
          <OverviewStats help={help} />
          <Tabs
            size="small"
            items={[
              {
                key: 'logs',
                label: 'Logs',
                children: (
                  <LogsTab
                    clearLogs={clearLogs}
                    loadLogs={loadLogs}
                    logEventOptions={logEventOptions}
                    logLevelOptions={logLevelOptions}
                    logSourceOptions={logSourceOptions}
                    logTargetIdOptions={logTargetIdOptions}
                    logs={logs}
                    logsForm={logsForm}
                    screenOptions={screenOptions}
                  />
                ),
              },
              {
                key: 'action',
                label: 'Action',
                children: (
                  <ActionTab
                    actionQueryActionOptions={actionQueryActionOptions}
                    actionQueryForm={actionQueryForm}
                    actionResult={actionResult}
                    actionTargetIdOptions={actionTargetIdOptions}
                    actions={actions}
                    fillManualAction={fillManualAction}
                    loadActions={loadActions}
                    manualActionArgNames={manualActionArgNames}
                    manualActionForm={manualActionForm}
                    manualActionOptions={manualActionOptions}
                    manualActionTargetId={manualActionTargetId}
                    runAction={runAction}
                    runManualAction={runManualAction}
                    screenOptions={screenOptions}
                    selectedManualActionDescriptor={selectedManualActionDescriptor}
                  />
                ),
              },
              {
                key: 'state',
                label: 'State',
                children: (
                  <StateTab
                    loadState={loadState}
                    stateData={stateData}
                    stateForm={stateForm}
                    stateKeyOptions={stateKeyOptions}
                    stateTargetIdOptions={stateTargetIdOptions}
                  />
                ),
              },
              {
                key: 'snapshot',
                label: 'Snapshot',
                children: (
                  <SnapshotTab
                    loadSnapshot={loadSnapshot}
                    loadSnapshotSummary={loadSnapshotSummary}
                    snapshot={snapshot}
                    snapshotForm={snapshotForm}
                    snapshotTargetIdOptions={snapshotTargetIdOptions}
                    snapshotTypeOptions={snapshotTypeOptions}
                  />
                ),
              },
              {
                key: 'help',
                label: 'Help',
                children: <HelpTab help={help} />,
              },
            ]}
          />
          <Divider />
          <Typography.Text type="secondary">
            Standalone console for Android / Swift debug bridge.
          </Typography.Text>
        </Space>
      </Layout.Content>
    </Layout>
  )
}
