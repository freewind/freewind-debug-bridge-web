import { initClient } from '@ts-rest/core'
import { debugBridgeContract, type ActionCatalogQuery, type ActionCatalogResponse, type ActionRequest, type ActionSuccessResponse, type HelpResponse, type LogsClearResponse, type LogsQuery, type LogsResponse, type MetaResponse, type SnapshotQuery, type SnapshotResponse, type StateQuery, type StateResponse } from '../api-contract'

type QueryInput = Record<string, unknown>
type QueryValue = string | number | boolean

const clientByBaseURL = new Map<string, ReturnType<typeof createDebugBridgeClient>>()

function normalizeBaseURL(baseURL: string) {
  return baseURL.trim().replace(/\/+$/, '')
}

function createDebugBridgeClient(baseURL: string) {
  return initClient(debugBridgeContract, {
    baseUrl: normalizeBaseURL(baseURL),
    throwOnUnknownStatus: false,
    validateResponse: true,
  })
}

function getClient(baseURL: string) {
  const normalizedBaseURL = normalizeBaseURL(baseURL)
  const cached = clientByBaseURL.get(normalizedBaseURL)
  if (cached) {
    return cached
  }

  const client = createDebugBridgeClient(normalizedBaseURL)
  clientByBaseURL.set(normalizedBaseURL, client)
  return client
}

function toWireQuery<T extends Record<string, unknown>>(values?: QueryInput): T | undefined {
  if (!values) {
    return undefined
  }

  const query: Record<string, QueryValue> = {}
  Object.entries(values).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null) {
      return
    }

    if (Array.isArray(rawValue)) {
      const value = rawValue.map((item) => String(item).trim()).filter(Boolean).join(',')
      if (value) {
        query[key] = value
      }
      return
    }

    if (typeof rawValue === 'string') {
      const value = rawValue.trim()
      if (value) {
        query[key] = value
      }
      return
    }

    if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
      query[key] = rawValue
    }
  })

  return Object.keys(query).length ? (query as T) : undefined
}

function getErrorMessage(body: unknown) {
  if (body && typeof body === 'object') {
    const message = (body as { message?: unknown }).message
    if (typeof message === 'string') {
      return message
    }
  }

  return 'request failed'
}

function unwrapBody<T>(response: { status: number; body: unknown }, expectedStatuses: number[]) {
  if (expectedStatuses.includes(response.status)) {
    return response.body as T
  }

  throw new Error(getErrorMessage(response.body))
}

export async function getMeta(baseURL: string): Promise<MetaResponse> {
  const response = await getClient(baseURL).getMeta()
  return unwrapBody<MetaResponse>(response, [200])
}

export async function getHelp(baseURL: string): Promise<HelpResponse> {
  const response = await getClient(baseURL).getHelp()
  return unwrapBody<HelpResponse>(response, [200])
}

export async function getActionCatalog(
  baseURL: string,
  query?: QueryInput,
): Promise<ActionCatalogResponse> {
  const wireQuery = toWireQuery<ActionCatalogQuery>(query)
  const response = wireQuery
    ? await getClient(baseURL).getActionCatalog({ query: wireQuery })
    : await getClient(baseURL).getActionCatalog()
  return unwrapBody<ActionCatalogResponse>(response, [200])
}

export async function getLogs(baseURL: string, query?: QueryInput): Promise<LogsResponse> {
  const wireQuery = toWireQuery<LogsQuery>(query)
  const response = wireQuery
    ? await getClient(baseURL).getLogs({ query: wireQuery })
    : await getClient(baseURL).getLogs()
  return unwrapBody<LogsResponse>(response, [200])
}

export async function getState(baseURL: string, query?: QueryInput): Promise<StateResponse> {
  const wireQuery = toWireQuery<StateQuery>(query)
  const response = wireQuery
    ? await getClient(baseURL).getState({ query: wireQuery })
    : await getClient(baseURL).getState()
  return unwrapBody<StateResponse>(response, [200])
}

export async function getSnapshot(baseURL: string, query?: QueryInput): Promise<SnapshotResponse> {
  const wireQuery = toWireQuery<SnapshotQuery>(query)
  const response = wireQuery
    ? await getClient(baseURL).getSnapshot({ query: wireQuery })
    : await getClient(baseURL).getSnapshot()
  return unwrapBody<SnapshotResponse>(response, [200])
}

export async function runAction(
  baseURL: string,
  payload: ActionRequest,
): Promise<ActionSuccessResponse> {
  const response = await getClient(baseURL).runAction({
    body: payload,
  })
  return unwrapBody<ActionSuccessResponse>(response, [200])
}

export async function clearLogs(baseURL: string): Promise<LogsClearResponse> {
  const response = await getClient(baseURL).clearLogs()
  return unwrapBody<LogsClearResponse>(response, [200])
}
