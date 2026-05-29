import { useMount, useRequest } from 'ahooks'
import { useState } from 'react'
import type { FormInstance } from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type {
  ActionCatalogResponse,
  ActionRequest,
  ActionResponse,
  HelpResponse,
  LogsClearResponse,
  LogsResponse,
  MetaResponse,
  SnapshotResponse,
  StateResponse,
} from '../generated/api-types'
import { buildQuery, fetchJSON } from '../api'
import { normalizeAPIBaseURL } from '../utils/normalizeAPIBaseURL'
import { normalizeSnapshotQuery } from '../utils/normalizeSnapshotQuery'
import { readInitialAPIBaseURL } from '../utils/readInitialAPIBaseURL'

type Props = {
  actionQueryForm: FormInstance
  logsForm: FormInstance
  manualActionForm: FormInstance
  message: MessageInstance
  snapshotForm: FormInstance
  stateForm: FormInstance
}

export function useDebugBridgeRequests({
  actionQueryForm,
  logsForm,
  manualActionForm,
  message,
  snapshotForm,
  stateForm,
}: Props) {
  const initialAPIBaseURL = readInitialAPIBaseURL()
  const [apiBaseURL, setApiBaseURL] = useState(initialAPIBaseURL)
  const [apiBaseURLInput, setApiBaseURLInput] = useState(initialAPIBaseURL)
  const [meta, setMeta] = useState<MetaResponse | null>(null)
  const [help, setHelp] = useState<HelpResponse | null>(null)
  const [actions, setActions] = useState<ActionCatalogResponse | null>(null)
  const [logs, setLogs] = useState<LogsResponse | null>(null)
  const [stateData, setStateData] = useState<StateResponse | null>(null)
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null)
  const [actionResult, setActionResult] = useState<ActionResponse | LogsClearResponse | null>(null)

  function resolveBaseURL(nextBaseURL?: string) {
    const resolved = normalizeAPIBaseURL(nextBaseURL ?? apiBaseURL)
    if (!resolved) {
      throw new Error('请先填写 API base URL')
    }
    return resolved
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

  async function requestJSON<T>(nextBaseURL: string | undefined, path: string, init?: RequestInit) {
    return fetchJSON<T>(path, {
      ...init,
      baseURL: resolveBaseURL(nextBaseURL),
    })
  }

  const metaRequest = useRequest(
    async (nextBaseURL?: string) => requestJSON<MetaResponse>(nextBaseURL, '/meta'),
    {
      manual: true,
      onSuccess: setMeta,
    },
  )
  const helpRequest = useRequest(
    async (nextBaseURL?: string) => requestJSON<HelpResponse>(nextBaseURL, '/help'),
    {
      manual: true,
      onSuccess: setHelp,
    },
  )
  const actionsRequest = useRequest(
    async (nextBaseURL?: string, values?: Record<string, unknown>) => {
      const formValues = values ?? actionQueryForm.getFieldsValue()
      return requestJSON<ActionCatalogResponse>(nextBaseURL, `/action${buildQuery(formValues)}`)
    },
    {
      manual: true,
      onSuccess: setActions,
    },
  )
  const logsRequest = useRequest(
    async (nextBaseURL?: string, values?: Record<string, unknown>) => {
      const formValues = values ?? logsForm.getFieldsValue()
      return requestJSON<LogsResponse>(nextBaseURL, `/logs${buildQuery(formValues)}`)
    },
    {
      manual: true,
      onSuccess: setLogs,
    },
  )
  const stateRequest = useRequest(
    async (nextBaseURL?: string, values?: Record<string, unknown>) => {
      const formValues = values ?? stateForm.getFieldsValue()
      return requestJSON<StateResponse>(nextBaseURL, `/state${buildQuery(formValues)}`)
    },
    {
      manual: true,
      onSuccess: setStateData,
    },
  )
  const snapshotRequest = useRequest(
    async (nextBaseURL?: string, values?: Record<string, unknown>) => {
      const formValues = normalizeSnapshotQuery(values ?? snapshotForm.getFieldsValue())
      return requestJSON<SnapshotResponse>(nextBaseURL, `/snapshot${buildQuery(formValues)}`)
    },
    {
      manual: true,
      onSuccess: setSnapshot,
    },
  )
  const snapshotSummaryRequest = useRequest(
    async (nextBaseURL?: string) => requestJSON<SnapshotResponse>(nextBaseURL, '/snapshot'),
    {
      manual: true,
      onSuccess: setSnapshot,
    },
  )
  const actionRequest = useRequest(
    async (payload: ActionRequest, nextBaseURL?: string) =>
      requestJSON<ActionResponse>(nextBaseURL, '/action', {
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
    {
      manual: true,
      onSuccess: (result) => {
        setActionResult(result)
      },
    },
  )
  const clearLogsRequest = useRequest(
    async (nextBaseURL?: string) =>
      requestJSON<LogsClearResponse>(nextBaseURL, '/logs', {
        method: 'DELETE',
      }),
    {
      manual: true,
      onSuccess: (result) => {
        setActionResult(result)
      },
    },
  )

  async function withNotice<T>(runner: () => Promise<T>) {
    try {
      return await runner()
    } catch (error) {
      message.error(String((error as Error).message || error))
      return null
    }
  }

  async function refreshAll(nextBaseURL?: string) {
    const normalizedValue = normalizeAPIBaseURL(nextBaseURL ?? apiBaseURL)
    if (!normalizedValue) {
      clearRemoteData()
      return null
    }

    return withNotice(async () => {
      await Promise.all([
        metaRequest.runAsync(normalizedValue),
        helpRequest.runAsync(normalizedValue),
        actionsRequest.runAsync(normalizedValue, {}),
        logsRequest.runAsync(normalizedValue, {}),
        stateRequest.runAsync(normalizedValue, {}),
        snapshotRequest.runAsync(normalizedValue, normalizeSnapshotQuery(snapshotForm.getFieldsValue())),
      ])
      return true
    })
  }

  async function applyAPIBaseURL(nextValue?: string) {
    return withNotice(async () => {
      const normalizedValue = normalizeAPIBaseURL(nextValue ?? apiBaseURLInput)
      if (normalizedValue) {
        const parsed = new URL(normalizedValue)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('API base URL must start with http:// or https://')
        }
      }

      setApiBaseURL(normalizedValue)
      setApiBaseURLInput(normalizedValue)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('freewind-debug-bridge-web/api-base-url', normalizedValue)
      }

      if (!normalizedValue) {
        clearRemoteData()
        return true
      }

      return refreshAll(normalizedValue)
    })
  }

  async function loadActions(values?: Record<string, unknown>) {
    return withNotice(() => actionsRequest.runAsync(undefined, values))
  }

  async function loadLogs(values?: Record<string, unknown>) {
    return withNotice(() => logsRequest.runAsync(undefined, values))
  }

  async function loadState(values?: Record<string, unknown>) {
    return withNotice(() => stateRequest.runAsync(undefined, values))
  }

  async function loadSnapshot(values?: Record<string, unknown>) {
    return withNotice(() => snapshotRequest.runAsync(undefined, values))
  }

  async function loadSnapshotSummary() {
    return withNotice(() => snapshotSummaryRequest.runAsync(undefined))
  }

  async function runAction(payload: ActionRequest) {
    const result = await withNotice(() => actionRequest.runAsync(payload, undefined))
    if (!result) {
      return null
    }

    message.success(result.message)
    await Promise.all([
      helpRequest.runAsync(undefined),
      logsRequest.runAsync(undefined, {}),
      stateRequest.runAsync(undefined, {}),
      snapshotRequest.runAsync(undefined, undefined),
    ])
    return result
  }

  async function clearLogs() {
    const result = await withNotice(() => clearLogsRequest.runAsync(undefined))
    if (!result) {
      return null
    }

    message.success(result.message)
    await Promise.all([helpRequest.runAsync(undefined), logsRequest.runAsync(undefined, {})])
    return result
  }

  useMount(() => {
    manualActionForm.setFieldsValue({ argValues: {}, source: 'human' })
    if (initialAPIBaseURL) {
      void refreshAll(initialAPIBaseURL)
    }
  })

  return {
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
  }
}
