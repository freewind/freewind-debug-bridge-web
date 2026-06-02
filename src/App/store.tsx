import { App as AntdApp, Form } from 'antd'
import { type FC, type PropsWithChildren, useCallback, useMemo } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import type { ActionRequest } from '../api-contract'
import { useDebugBridgeRequests } from '../hooks'
import { buildActionKey } from '../utils/buildActionKey'
import type { ManualActionFormValues } from './types'

const useAppStoreValue = () => {
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
    applyAPIBaseURL: rawApplyAPIBaseURL,
    clearLogs: rawClearLogs,
    loadActions: rawLoadActions,
    loadLogs: rawLoadLogs,
    loadSnapshot: rawLoadSnapshot,
    loadSnapshotSummary: rawLoadSnapshotSummary,
    loadState: rawLoadState,
    refreshAll: rawRefreshAll,
    runAction: rawRunAction,
    ...debugBridge
  } = useDebugBridgeRequests({
    actionQueryForm,
    logsForm,
    manualActionForm,
    message,
    snapshotForm,
    stateForm,
  })

  const actionDescriptorByKey = useMemo(() => {
    return (debugBridge.actions?.items || [])
      .flatMap((item) => {
        return item.actions.map((action) => ({
          ...action,
          targetId: item.targetId,
        }))
      })
      .reduce<Record<string, { args: string[]; example: ActionRequest }>>((result, item) => {
        result[buildActionKey(item.targetId, item.name)] = item
        return result
      }, {})
  }, [debugBridge.actions])

  const applyAPIBaseURL = useCallback((nextValue?: string) => rawApplyAPIBaseURL(nextValue), [rawApplyAPIBaseURL])
  const clearLogs = useCallback(() => rawClearLogs(), [rawClearLogs])
  const loadActions = useCallback((values?: Record<string, unknown>) => rawLoadActions(values), [rawLoadActions])
  const loadLogs = useCallback((values?: Record<string, unknown>) => rawLoadLogs(values), [rawLoadLogs])
  const loadSnapshot = useCallback((values?: Record<string, unknown>) => rawLoadSnapshot(values), [rawLoadSnapshot])
  const loadSnapshotSummary = useCallback(() => rawLoadSnapshotSummary(), [rawLoadSnapshotSummary])
  const loadState = useCallback((values?: Record<string, unknown>) => rawLoadState(values), [rawLoadState])
  const refreshAll = useCallback((nextBaseURL?: string) => rawRefreshAll(nextBaseURL), [rawRefreshAll])
  const runAction = useCallback((payload: ActionRequest) => rawRunAction(payload), [rawRunAction])

  const hydrateManualAction = useCallback((targetId: string, action: string) => {
    const descriptor = actionDescriptorByKey[buildActionKey(targetId, action)]
    if (!descriptor) {
      manualActionForm.setFieldsValue({
        action,
        targetId,
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
      action,
      argValues,
      dx: descriptor.example.dx ?? undefined,
      dy: descriptor.example.dy ?? undefined,
      targetId,
      text: descriptor.args.includes('text') ? descriptor.example.text ?? undefined : undefined,
    })
  }, [actionDescriptorByKey, manualActionForm])

  const fillManualAction = useCallback((targetId: string, action: string) => {
    hydrateManualAction(targetId, action)
    message.info(`filled ${targetId} ${action}`)
  }, [hydrateManualAction, message])

  const runManualAction = useCallback(async () => {
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
      args: Object.keys(args).length ? args : undefined,
      dx: values.dx ?? undefined,
      dy: values.dy ?? undefined,
      source: values.source?.trim() || undefined,
      targetId: values.targetId || '',
      text: values.text?.trim() || undefined,
    })
  }, [manualActionForm, runAction])

  return {
    actionQueryForm,
    actionQueryTargetId,
    applyAPIBaseURL,
    clearLogs,
    fillManualAction,
    loadActions,
    loadLogs,
    loadSnapshot,
    loadSnapshotSummary,
    loadState,
    logsForm,
    manualActionAction,
    manualActionForm,
    manualActionTargetId,
    refreshAll,
    runAction,
    runManualAction,
    snapshotForm,
    stateForm,
    ...debugBridge,
  }
}

type AppStore = ReturnType<typeof useAppStoreValue>

const AppStoreContext = createContext<AppStore | null>(null)

const getRequiredStore = (store: AppStore | null) => {
  if (!store) {
    throw new Error('AppStoreProvider is missing')
  }

  return store
}

export const AppStoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const value = useAppStoreValue()

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export const useAppStore = <T,>(selector: (store: AppStore) => T) =>
  useContextSelector(AppStoreContext, (store) => selector(getRequiredStore(store)))
