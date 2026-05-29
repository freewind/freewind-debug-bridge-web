import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

// @rule 本文件是 Debug Bridge HTTP 契约的唯一来源；Android/Swift 等端从 generated/openapi.yaml 生成各自类型
@service(#{ title: "Freewind Debug Bridge" })
@server("http://localhost", "Debug bridge server")
namespace DebugBridge;

alias StringMap = Record<string>;

model MetaResponse {
  appName: string;
  buildVersion: int32;
}

model HelpEndpoint {
  method: string;
  path: string;
  summary: string;
  queryFields?: string[];
  bodyFields?: string[];
}

model HelpCounts {
  actionTargetCount: int32;
  logCount: int32;
  stateKeyCount: int32;
  snapshotNodeCount: int32;
}

model HelpResponse {
  appName: string;
  consoleTitle?: string;
  screenName: string;
  serverTime: string;
  capabilities: string[];
  counts: HelpCounts;
  endpoints: HelpEndpoint[];
  examples: string[];
}

model ActionRequest {
  action: string;
  targetId: string;
  text?: string;
  dx?: int32;
  dy?: int32;
  args?: StringMap;
  source?: string;
}

model ActionSuccessResponse {
  accepted: true;
  message: string;
  action?: string;
  targetId?: string;
  durationMs?: int32;
}

model ActionErrorResponse {
  accepted: false;
  message: string;
  errorType?: string;
  timedOut?: boolean;
  durationMs?: int32;
}

union ActionResponse {
  success: ActionSuccessResponse,
  error: ActionErrorResponse,
}

model ActionCatalogItemAction {
  name: string;
  args: string[];
  summary: string;
  example: ActionRequest;
}

model ActionCatalogItem {
  targetId: string;
  targetType: string;
  screen: string;
  actions: ActionCatalogItemAction[];
}

model ActionCatalogSummary {
  targetCount: int32;
  actionCount: int32;
}

model ActionCatalogResponse {
  summary: ActionCatalogSummary;
  items: ActionCatalogItem[];
}

model LogEntry {
  seq: int32;
  time: string;
  source: string;
  level: string;
  event: string;
  targetId?: string;
  summary: string;
  data: StringMap;
}

model LogsTimeRange {
  from: string;
  to: string;
}

model LogsSummary {
  total: int32;
  timeRange?: LogsTimeRange;
  levelCounts: StringMap;
  sourceCounts: StringMap;
  eventCountsTop: StringMap;
}

model LogsResponse {
  summary?: LogsSummary;
  items?: LogEntry[];
  nextAfterSeq?: int32;
}

model LogsClearResponse {
  accepted: true;
  message: string;
  clearedCount: int32;
}

model StateKeySample {
  key: string;
  sample: string;
}

model StateSummary {
  appStateKeys: StateKeySample[];
  targetStateTargets: string[];
}

model StateResponse {
  summary?: StateSummary;
  appState?: StringMap;
  targetState?: StringMap;
}

model SnapshotBounds {
  left: float64;
  top: float64;
  width: float64;
  height: float64;
}

model SnapshotNode {
  id: string;
  parentId?: string;
  type?: string;
  text?: string;
  role?: string;
  backgroundColor?: string;
  contentColor?: string;
  visible?: boolean;
  enabled?: boolean;
  clickable?: boolean;
  value?: string;
  extra?: StringMap;
  bounds?: SnapshotBounds;
}

model SnapshotSummary {
  screen: string;
  nodeCount: int32;
  rootIds: string[];
  typeCounts: StringMap;
  clickableCount: int32;
}

model SnapshotResponse {
  summary?: SnapshotSummary;
  fieldCatalog?: string[];
  examples?: string[];
  screen?: string;
  nodes?: SnapshotNode[];
}

enum StateScope {
  app: "app",
  target: "target",
  branch: "branch",
}

enum SnapshotScope {
  self: "self",
  branchToRoot: "branchToRoot",
  subtree: "subtree",
}

@route("/meta")
interface MetaRoutes {
  @get
  meta(): MetaResponse;
}

@route("/help")
interface HelpRoutes {
  @get
  help(): HelpResponse;
}

@route("/action")
interface ActionRoutes {
  @get
  listActions(
    @query targetId?: string,
    @query action?: string,
    @query screen?: string,
  ): ActionCatalogResponse;

  @post
  runAction(@body body: ActionRequest):
    | {
        @statusCode statusCode: 200;
        @body body: ActionSuccessResponse;
      }
    | {
        @statusCode statusCode: 400 | 500;
        @body body: ActionErrorResponse;
      };
}

@route("/logs")
interface LogsRoutes {
  @get
  listLogs(
    @query event?: string,
    @query level?: string,
    @query source?: string,
    @query targetId?: string,
    @query screen?: string,
    @query from?: string,
    @query to?: string,
    @query limit?: int32,
    @query keyword?: string,
  ): LogsResponse;

  @delete
  clearLogs(): LogsClearResponse;
}

@route("/state")
interface StateRoutes {
  @get
  getState(
    @query keys?: string,
    @query targetId?: string,
    @query scope?: StateScope,
  ): StateResponse;
}

@route("/snapshot")
interface SnapshotRoutes {
  @get
  getSnapshot(
    @query targetId?: string,
    @query scope?: SnapshotScope,
    @query depth?: int32,
    @query types?: string,
    @query textKeyword?: string,
    @query visible?: boolean,
    @query enabled?: boolean,
    @query clickable?: boolean,
    @query fields?: string,
    @query limit?: int32,
  ): SnapshotResponse;
}
