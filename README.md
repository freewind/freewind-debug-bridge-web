# freewind-debug-bridge-web

独立调试台。

用途：

- 给 Android / Swift debug bridge 提供同一套 web console
- 在本仓维护唯一 HTTP 契约
- UI 行为以 Swift 侧现有 console 为基准收敛

## 开发

```bash
pnpm install
pnpm dev
pnpm build
```

默认按当前站点同源请求：

- `GET /help`
- `GET /action`
- `POST /action`
- `GET /logs`
- `DELETE /logs`
- `GET /state`
- `GET /snapshot`

## 契约

统一接口文档：

- [debug-bridge.openapi.ts](./debug-bridge.openapi.ts)
- [debug-bridge.openapi.yaml](./debug-bridge.openapi.yaml)

要求：

- Android debug server
- SwiftUI debug server

都必须满足这份契约；若有额外字段，只能追加，不能破坏已有字段语义。
