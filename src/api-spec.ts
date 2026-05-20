export type HttpMethod = 'GET' | 'POST' | 'DELETE'

export type RouteDef<
  Path extends string,
  Method extends HttpMethod,
  Req,
  Res,
> = {
  path: Path
  method: Method
  reqType: Req
  resType: Res
}

export type MetaResponse = {
  appName: string
  buildVersion: number
}

export type HelpResponse = {
  appName: string
  consoleTitle?: string
  screenName: string
  serverTime: string
  capabilities: string[]
  counts: {
    actionTargetCount: number
    logCount: number
    stateKeyCount: number
    snapshotNodeCount: number
  }
  endpoints: Array<{
    method: string
    path: string
    summary: string
    queryFields?: string[]
    bodyFields?: string[]
  }>
  examples: string[]
}

export type ActionRequest = {
  action: string
  targetId: string
  text?: string
  dx?: number
  dy?: number
  args?: Record<string, string>
  source?: string
}

export type ActionSuccessResponse = {
  accepted: true
  message: string
  action?: string
  targetId?: string
  durationMs?: number
}

export type ActionErrorResponse = {
  accepted: false
  message: string
  errorType?: string
  timedOut?: boolean
  durationMs?: number
}

export type ActionResponse =
  | ActionSuccessResponse
  | ActionErrorResponse

export type ActionCatalogResponse = {
  summary: {
    targetCount: number
    actionCount: number
  }
  items: Array<{
    targetId: string
    targetType: string
    screen: string
    actions: Array<{
      name: string
      args: string[]
      summary: string
      example: ActionRequest
    }>
  }>
}

export type LogEntry = {
  seq: number
  time: string
  source: string
  level: string
  event: string
  targetId?: string
  summary: string
  data: Record<string, string>
}

export type LogsResponse = {
  summary?: {
    total: number
    timeRange?: {
      from: string
      to: string
    }
    levelCounts: Record<string, number>
    sourceCounts: Record<string, number>
    eventCountsTop: Record<string, number>
  }
  items?: LogEntry[]
  nextAfterSeq?: number
}

export type LogsClearResponse = {
  accepted: true
  message: string
  clearedCount: number
}

export type StateResponse = {
  summary?: {
    appStateKeys: Array<{ key: string; sample: string }>
    targetStateTargets: string[]
  }
  appState?: Record<string, string>
  targetState?: Record<string, string>
}

export type SnapshotNode = {
  id: string
  parentId?: string
  type?: string
  text?: string
  role?: string
  backgroundColor?: string
  contentColor?: string
  visible?: boolean
  enabled?: boolean
  clickable?: boolean
  value?: string
  extra?: Record<string, string>
  bounds?: {
    left: number
    top: number
    width: number
    height: number
  }
}

export type SnapshotPreviewNode = SnapshotNode & {
  bounds: NonNullable<SnapshotNode['bounds']>
}

export type SnapshotResponse = {
  summary?: {
    screen: string
    nodeCount: number
    rootIds: string[]
    typeCounts: Record<string, number>
    clickableCount: number
  }
  fieldCatalog?: string[]
  examples?: string[]
  screen?: string
  nodes?: SnapshotNode[]
}

export type MetaRoute = RouteDef<
  '/meta',
  'GET',
  void,
  MetaResponse
>

export type HelpRoute = RouteDef<
  '/help',
  'GET',
  void,
  HelpResponse
>

export type ActionGetRoute = RouteDef<
  '/action',
  'GET',
  {
    query: {
      targetId?: string
      action?: string
      screen?: string
    }
  },
  ActionCatalogResponse
>

export type ActionPostRoute = RouteDef<
  '/action',
  'POST',
  {
    body: {
      action: string
      targetId: string
      text?: string
      dx?: number
      dy?: number
      args?: Record<string, string>
      source?: string
    }
  },
  {
    200: ActionSuccessResponse
    400: ActionErrorResponse
    500: ActionErrorResponse
  }
>

export type LogsGetRoute = RouteDef<
  '/logs',
  'GET',
  {
    query: {
      event?: string
      level?: string
      source?: string
      targetId?: string
      screen?: string
      from?: string
      to?: string
      limit?: number
      keyword?: string
    }
  },
  LogsResponse
>

export type LogsDeleteRoute = RouteDef<
  '/logs',
  'DELETE',
  void,
  LogsClearResponse
>

export type StateGetRoute = RouteDef<
  '/state',
  'GET',
  {
    query: {
      keys?: string
      targetId?: string
      scope?: 'app' | 'target' | 'branch'
    }
  },
  StateResponse
>

export type SnapshotGetRoute = RouteDef<
  '/snapshot',
  'GET',
  {
    query: {
      targetId?: string
      scope?: 'self' | 'branchToRoot' | 'subtree'
      depth?: number
      types?: string
      textKeyword?: string
      visible?: boolean
      enabled?: boolean
      clickable?: boolean
      fields?: string
      limit?: number
    }
  },
  SnapshotResponse
>

export type DebugBridgeRoute =
  | MetaRoute
  | HelpRoute
  | ActionGetRoute
  | ActionPostRoute
  | LogsGetRoute
  | LogsDeleteRoute
  | StateGetRoute
  | SnapshotGetRoute

export type DebugBridgeRouteMap = {
  meta: MetaRoute
  help: HelpRoute
  actionGet: ActionGetRoute
  actionPost: ActionPostRoute
  logsGet: LogsGetRoute
  logsDelete: LogsDeleteRoute
  stateGet: StateGetRoute
  snapshotGet: SnapshotGetRoute
}
