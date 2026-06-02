import type { z } from 'zod'
import type {
  actionCatalogItemActionSchema,
  actionCatalogItemSchema,
  actionCatalogQuerySchema,
  actionCatalogResponseSchema,
  actionCatalogSummarySchema,
  actionErrorResponseSchema,
  actionRequestSchema,
  actionResponseSchema,
  actionSuccessResponseSchema,
  helpCountsSchema,
  helpEndpointSchema,
  helpResponseSchema,
  logEntrySchema,
  logsClearResponseSchema,
  logsQuerySchema,
  logsResponseSchema,
  logsSummarySchema,
  logsTimeRangeSchema,
  metaResponseSchema,
  snapshotBoundsSchema,
  snapshotNodeSchema,
  snapshotQuerySchema,
  snapshotResponseSchema,
  snapshotScopeSchema,
  snapshotSummarySchema,
  stateKeySampleSchema,
  stateQuerySchema,
  stateResponseSchema,
  stateScopeSchema,
  stateSummarySchema,
} from './schema'

export type MetaResponse = z.infer<typeof metaResponseSchema>
export type HelpEndpoint = z.infer<typeof helpEndpointSchema>
export type HelpCounts = z.infer<typeof helpCountsSchema>
export type HelpResponse = z.infer<typeof helpResponseSchema>
export type ActionRequest = z.infer<typeof actionRequestSchema>
export type ActionSuccessResponse = z.infer<typeof actionSuccessResponseSchema>
export type ActionErrorResponse = z.infer<typeof actionErrorResponseSchema>
export type ActionResponse = z.infer<typeof actionResponseSchema>
export type ActionCatalogItemAction = z.infer<typeof actionCatalogItemActionSchema>
export type ActionCatalogItem = z.infer<typeof actionCatalogItemSchema>
export type ActionCatalogSummary = z.infer<typeof actionCatalogSummarySchema>
export type ActionCatalogResponse = z.infer<typeof actionCatalogResponseSchema>
export type LogEntry = z.infer<typeof logEntrySchema>
export type LogsTimeRange = z.infer<typeof logsTimeRangeSchema>
export type LogsSummary = z.infer<typeof logsSummarySchema>
export type LogsResponse = z.infer<typeof logsResponseSchema>
export type LogsClearResponse = z.infer<typeof logsClearResponseSchema>
export type StateKeySample = z.infer<typeof stateKeySampleSchema>
export type StateSummary = z.infer<typeof stateSummarySchema>
export type StateResponse = z.infer<typeof stateResponseSchema>
export type SnapshotBounds = z.infer<typeof snapshotBoundsSchema>
export type SnapshotNode = z.infer<typeof snapshotNodeSchema>
export type SnapshotSummary = z.infer<typeof snapshotSummarySchema>
export type SnapshotResponse = z.infer<typeof snapshotResponseSchema>
export type StateScope = z.infer<typeof stateScopeSchema>
export type SnapshotScope = z.infer<typeof snapshotScopeSchema>
export type ActionCatalogQuery = z.input<typeof actionCatalogQuerySchema>
export type LogsQuery = z.input<typeof logsQuerySchema>
export type StateQuery = z.input<typeof stateQuerySchema>
export type SnapshotQuery = z.input<typeof snapshotQuerySchema>
