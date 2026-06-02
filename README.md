# freewind-debug-bridge-web

独立调试台。

用途：

- 给 Android / Swift / 更多语言的 debug bridge 提供同一套 web console
- 在本仓维护唯一 HTTP 契约

## 开发

```bash
pnpm install
pnpm dev
pnpm build
```

默认按当前站点同源请求：

- `GET /meta`
- `GET /help`
- `GET /action`
- `POST /action`
- `GET /logs`
- `DELETE /logs`
- `GET /state`
- `GET /snapshot`

## 契约（api-contract）

唯一来源：

- [`src/api-contract/schema.ts`](./src/api-contract/schema.ts)
- [`src/api-contract/contract.ts`](./src/api-contract/contract.ts)

改契约后执行：

```bash
pnpm generate
```

会产出：

| 文件 | 用途 |
|------|------|
| `generated/openapi.yaml` | 给 Kotlin / Swift / Rust 等端同步的 OpenAPI 3.0 |

Web 侧直接 import contract types：

```ts
import type { ActionRequest, SnapshotResponse } from './src/api-contract'
```

要求：

- Android debug server
- SwiftUI debug server

都必须满足这份契约；若有额外字段，只能追加，不能破坏已有字段语义。

## 其他语言：从 OpenAPI 生成类型

各端不需要手抄类型，统一从 `generated/openapi.yaml` 生成。

推荐工具：[OpenAPI Generator](https://openapi-generator.tech/)（开源，语言覆盖最广）。

生成 bridge models：

```bash
pnpm generate
./scripts/generate-bridge-models.sh
```

### 工作流建议

1. 契约变更 → 改 `src/api-contract`
2. 本仓 `pnpm generate`
3. 本仓 `./scripts/generate-bridge-models.sh`
4. 3 个 bridge 仓编译验证
