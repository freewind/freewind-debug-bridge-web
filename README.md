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

## 契约（TypeSpec）

**唯一来源**：[`typespec/main.tsp`](./typespec/main.tsp)

改契约后执行：

```bash
pnpm generate
```

会产出：

| 文件 | 用途 |
|------|------|
| `typespec/generated/openapi.yaml` | 给其他语言/工具用的 OpenAPI 3.0 |
| `src/generated/api-types.ts` | 本 web 项目用的 TS 类型（业务代码直接 import） |

Web 侧：

```ts
import type { ActionRequest, SnapshotResponse } from '../generated/api-types'
```

要求：

- Android debug server
- SwiftUI debug server

都必须满足这份契约；若有额外字段，只能追加，不能破坏已有字段语义。

## 其他语言：从 OpenAPI 生成类型

各端不需要手抄类型，统一从 `typespec/generated/openapi.yaml` 生成。

推荐工具：[OpenAPI Generator](https://openapi-generator.tech/)（开源，语言覆盖最广）。

### 安装 CLI

```bash
# 需要 Java 8+
brew install openapi-generator
# 或
npm install -g @openapitools/openapi-generator-cli
```

### 生成示例

在项目根目录执行（`-i` 指向本仓 OpenAPI 文件）：

```bash
OPENAPI=typespec/generated/openapi.yaml

# Kotlin（Android）
openapi-generator generate -i $OPENAPI -g kotlin -o /tmp/debug-bridge-kotlin \
  --global-property models,supportingFiles

# Swift（iOS / SwiftUI）
openapi-generator generate -i $OPENAPI -g swift5 -o /tmp/debug-bridge-swift \
  --global-property models,supportingFiles

# Rust（Dioxus 等）
openapi-generator generate -i $OPENAPI -g rust -o /tmp/debug-bridge-rust \
  --global-property models,supportingFiles

# Java
openapi-generator generate -i $OPENAPI -g java -o /tmp/debug-bridge-java \
  --global-property models,supportingFiles

# Python
openapi-generator generate -i $OPENAPI -g python -o /tmp/debug-bridge-python \
  --global-property models,supportingFiles
```

`--global-property models,supportingFiles` 表示**只生成数据模型**，不生成 HTTP 客户端（各端已有自己的 server/client 框架）。

### 轻量替代：只要 JSON 模型

若只需从 sample JSON 推断 model，可用 [quicktype](https://quicktype.io/)：

```bash
npm install -g quicktype
quicktype --lang kotlin sample-action-response.json -o Models.kt
```

也可从 OpenAPI 里提取某个 schema 的 JSON Schema 再喂给 quicktype。

### 工作流建议

1. 契约变更 → 改 `typespec/main.tsp`
2. 本仓 `pnpm generate` → 更新 `openapi.yaml` + web TS 类型
3. 各 bridge 仓库 CI 拉取/同步 `openapi.yaml`，跑 OpenAPI Generator 生成 model
4. **禁止手改生成代码**；生成目录加入 `.gitignore` 或单独 submodule

### 可选商业工具

若需要更 idiomatic 的 SDK（含重试、OAuth 等），可看 [Speakeasy](https://www.speakeasy.com/)、[Fern](https://buildwithfern.com/)，输入同样是 OpenAPI。
