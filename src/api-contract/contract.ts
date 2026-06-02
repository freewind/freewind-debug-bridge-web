import { initContract } from '@ts-rest/core'
import { ApiPath, toContractPath } from './api-path'
import {
  actionCatalogQuerySchema,
  actionCatalogResponseSchema,
  actionErrorResponseSchema,
  actionRequestSchema,
  actionSuccessResponseSchema,
  helpResponseSchema,
  logsClearResponseSchema,
  logsQuerySchema,
  logsResponseSchema,
  metaResponseSchema,
  snapshotQuerySchema,
  snapshotResponseSchema,
  stateQuerySchema,
  stateResponseSchema,
} from './schema'

const c = initContract()

export const debugBridgeContract = c.router(
  {
    getMeta: {
      method: 'GET',
      path: toContractPath(ApiPath['/meta']),
      responses: {
        200: metaResponseSchema,
      },
      summary: 'Return app identity and build version',
    },
    getHelp: {
      method: 'GET',
      path: toContractPath(ApiPath['/help']),
      responses: {
        200: helpResponseSchema,
      },
      summary: 'Return dynamic full help',
    },
    getActionCatalog: {
      method: 'GET',
      path: toContractPath(ApiPath['/action']),
      query: actionCatalogQuerySchema,
      responses: {
        200: actionCatalogResponseSchema,
      },
      summary: 'List executable targets and actions',
    },
    runAction: {
      method: 'POST',
      path: toContractPath(ApiPath['/action']),
      body: actionRequestSchema,
      responses: {
        200: actionSuccessResponseSchema,
        400: actionErrorResponseSchema,
        500: actionErrorResponseSchema,
      },
      summary: 'Run one concrete action',
    },
    getLogs: {
      method: 'GET',
      path: toContractPath(ApiPath['/logs']),
      query: logsQuerySchema,
      responses: {
        200: logsResponseSchema,
      },
      summary: 'Query logs',
    },
    clearLogs: {
      method: 'DELETE',
      path: toContractPath(ApiPath['/logs']),
      responses: {
        200: logsClearResponseSchema,
      },
      summary: 'Delete all logs',
    },
    getState: {
      method: 'GET',
      path: toContractPath(ApiPath['/state']),
      query: stateQuerySchema,
      responses: {
        200: stateResponseSchema,
      },
      summary: 'Query state',
    },
    getSnapshot: {
      method: 'GET',
      path: toContractPath(ApiPath['/snapshot']),
      query: snapshotQuerySchema,
      responses: {
        200: snapshotResponseSchema,
      },
      summary: 'Query snapshot tree',
    },
  },
  {
    strictStatusCodes: true,
  },
)
