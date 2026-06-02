import { extendApi } from '@anatine/zod-openapi'
import { z } from 'zod'

const named = <T extends z.ZodTypeAny>(title: string, schema: T) => extendApi(schema, { title })

const stringMapSchema = z.record(z.string())

export const metaResponseSchema = named(
  'MetaResponse',
  z.object({
    appName: z.string(),
    buildVersion: z.number().int(),
  }),
)

export const helpEndpointSchema = named(
  'HelpEndpoint',
  z.object({
    method: z.string(),
    path: z.string(),
    summary: z.string(),
    queryFields: z.array(z.string()).optional(),
    bodyFields: z.array(z.string()).optional(),
  }),
)

export const helpCountsSchema = named(
  'HelpCounts',
  z.object({
    actionTargetCount: z.number().int(),
    logCount: z.number().int(),
    stateKeyCount: z.number().int(),
    snapshotNodeCount: z.number().int(),
  }),
)

export const helpResponseSchema = named(
  'HelpResponse',
  z.object({
    appName: z.string(),
    consoleTitle: z.string().optional(),
    screenName: z.string(),
    serverTime: z.string(),
    capabilities: z.array(z.string()),
    counts: helpCountsSchema,
    endpoints: z.array(helpEndpointSchema),
    examples: z.array(z.string()),
  }),
)

export const actionRequestSchema = named(
  'ActionRequest',
  z.object({
    action: z.string(),
    targetId: z.string(),
    text: z.string().optional(),
    dx: z.number().int().optional(),
    dy: z.number().int().optional(),
    args: stringMapSchema.optional(),
    source: z.string().optional(),
  }),
)

export const actionSuccessResponseSchema = named(
  'ActionSuccessResponse',
  z.object({
    accepted: z.literal(true),
    message: z.string(),
    action: z.string().optional(),
    targetId: z.string().optional(),
    durationMs: z.number().int().optional(),
  }),
)

export const actionErrorResponseSchema = named(
  'ActionErrorResponse',
  z.object({
    accepted: z.literal(false),
    message: z.string(),
    errorType: z.string().optional(),
    timedOut: z.boolean().optional(),
    durationMs: z.number().int().optional(),
  }),
)

export const actionResponseSchema = named(
  'ActionResponse',
  z.discriminatedUnion('accepted', [actionSuccessResponseSchema, actionErrorResponseSchema]),
)

export const actionCatalogItemActionSchema = named(
  'ActionCatalogItemAction',
  z.object({
    name: z.string(),
    args: z.array(z.string()),
    summary: z.string(),
    example: actionRequestSchema,
  }),
)

export const actionCatalogItemSchema = named(
  'ActionCatalogItem',
  z.object({
    targetId: z.string(),
    targetType: z.string(),
    screen: z.string(),
    actions: z.array(actionCatalogItemActionSchema),
  }),
)

export const actionCatalogSummarySchema = named(
  'ActionCatalogSummary',
  z.object({
    targetCount: z.number().int(),
    actionCount: z.number().int(),
  }),
)

export const actionCatalogResponseSchema = named(
  'ActionCatalogResponse',
  z.object({
    summary: actionCatalogSummarySchema,
    items: z.array(actionCatalogItemSchema),
  }),
)

export const logEntrySchema = named(
  'LogEntry',
  z.object({
    seq: z.number().int(),
    time: z.string(),
    source: z.string(),
    level: z.string(),
    event: z.string(),
    targetId: z.string().optional(),
    summary: z.string(),
    data: stringMapSchema,
  }),
)

export const logsTimeRangeSchema = named(
  'LogsTimeRange',
  z.object({
    from: z.string(),
    to: z.string(),
  }),
)

export const logsSummarySchema = named(
  'LogsSummary',
  z.object({
    total: z.number().int(),
    timeRange: logsTimeRangeSchema.optional(),
    levelCounts: stringMapSchema,
    sourceCounts: stringMapSchema,
    eventCountsTop: stringMapSchema,
  }),
)

export const logsResponseSchema = named(
  'LogsResponse',
  z.object({
    summary: logsSummarySchema.optional(),
    items: z.array(logEntrySchema).optional(),
    nextAfterSeq: z.number().int().optional(),
  }),
)

export const logsClearResponseSchema = named(
  'LogsClearResponse',
  z.object({
    accepted: z.literal(true),
    message: z.string(),
    clearedCount: z.number().int(),
  }),
)

export const stateKeySampleSchema = named(
  'StateKeySample',
  z.object({
    key: z.string(),
    sample: z.string(),
  }),
)

export const stateSummarySchema = named(
  'StateSummary',
  z.object({
    appStateKeys: z.array(stateKeySampleSchema),
    targetStateTargets: z.array(z.string()),
  }),
)

export const stateResponseSchema = named(
  'StateResponse',
  z.object({
    summary: stateSummarySchema.optional(),
    appState: stringMapSchema.optional(),
    targetState: stringMapSchema.optional(),
  }),
)

export const snapshotBoundsSchema = named(
  'SnapshotBounds',
  z.object({
    left: z.number(),
    top: z.number(),
    width: z.number(),
    height: z.number(),
  }),
)

export const snapshotNodeSchema = named(
  'SnapshotNode',
  z.object({
    id: z.string(),
    parentId: z.string().optional(),
    type: z.string().optional(),
    text: z.string().optional(),
    role: z.string().optional(),
    backgroundColor: z.string().optional(),
    contentColor: z.string().optional(),
    visible: z.boolean().optional(),
    enabled: z.boolean().optional(),
    clickable: z.boolean().optional(),
    value: z.string().optional(),
    extra: stringMapSchema.optional(),
    bounds: snapshotBoundsSchema.optional(),
  }),
)

export const snapshotSummarySchema = named(
  'SnapshotSummary',
  z.object({
    screen: z.string(),
    nodeCount: z.number().int(),
    rootIds: z.array(z.string()),
    typeCounts: stringMapSchema,
    clickableCount: z.number().int(),
  }),
)

export const snapshotResponseSchema = named(
  'SnapshotResponse',
  z.object({
    summary: snapshotSummarySchema.optional(),
    fieldCatalog: z.array(z.string()).optional(),
    examples: z.array(z.string()).optional(),
    screen: z.string().optional(),
    nodes: z.array(snapshotNodeSchema).optional(),
  }),
)

export const stateScopeSchema = named('StateScope', z.enum(['app', 'target', 'branch']))

export const snapshotScopeSchema = named(
  'SnapshotScope',
  z.enum(['self', 'branchToRoot', 'subtree']),
)

export const actionCatalogQuerySchema = z.object({
  targetId: z.string().optional(),
  action: z.string().optional(),
  screen: z.string().optional(),
})

export const logsQuerySchema = z.object({
  event: z.string().optional(),
  level: z.string().optional(),
  source: z.string().optional(),
  targetId: z.string().optional(),
  screen: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().int().optional(),
  keyword: z.string().optional(),
})

export const stateQuerySchema = z.object({
  keys: z.string().optional(),
  targetId: z.string().optional(),
  scope: stateScopeSchema.optional(),
})

export const snapshotQuerySchema = z.object({
  targetId: z.string().optional(),
  scope: snapshotScopeSchema.optional(),
  depth: z.number().int().optional(),
  types: z.string().optional(),
  textKeyword: z.string().optional(),
  visible: z.boolean().optional(),
  enabled: z.boolean().optional(),
  clickable: z.boolean().optional(),
  fields: z.string().optional(),
  limit: z.number().int().optional(),
})
