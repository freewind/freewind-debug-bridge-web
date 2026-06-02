import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { generateOpenApi } from '@ts-rest/open-api'
import { stringify } from 'yaml'
import { debugBridgeContract } from '../src/api-contract'

const outputPath = resolve(process.cwd(), 'generated/openapi.yaml')

const openApiDocument = generateOpenApi(debugBridgeContract, {
  info: {
    title: 'Freewind Debug Bridge',
    version: '0.0.1',
  },
  servers: [
    {
      url: 'http://localhost',
      description: 'Debug bridge server',
    },
  ],
})

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, stringify(openApiDocument))
