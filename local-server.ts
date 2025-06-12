// Simple local server to run Lambda handlers via HTTP endpoints
// Usage: yarn ts-node local-server.ts

import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { lambdaEndpointDefinitions } from './lib/services/lambda/lambda-endpoint-definitions'
import { Request, Response } from 'express'

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const app = express()
app.use(express.json())

// Helper to simulate AWS Lambda event from Express req
function makeLambdaEvent(req: Request) {
  return {
    httpMethod: req.method,
    path: req.path,
    headers: req.headers,
    queryStringParameters: req.query,
    pathParameters: req.params,
    body: req.body ? JSON.stringify(req.body) : undefined,
    isBase64Encoded: false
  }
}

// Recursively clear require cache for a module and its children
declare const require: NodeRequire
function clearRequireCache(modulePath: string) {
  const mod = require.cache[modulePath]
  if (mod) {
    // Recursively clear children first
    mod.children.forEach((child) => clearRequireCache(child.id))
    delete require.cache[modulePath]
  }
}

// Register routes for each endpoint definition
const endpointRows: string[] = []
for (const def of lambdaEndpointDefinitions) {
  const routePath = '/' + def.path
  const method = def.method.toUpperCase()
  const handlerPath = path.join(__dirname, 'lib', 'services', 'lambda', 'handlers', def.handler)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(app as any)[def.method.toLowerCase()](routePath, async (req: Request, res: Response) => {
    try {
      clearRequireCache(require.resolve(handlerPath))
      const handlerModule = require(handlerPath)
      const handler = handlerModule.handler || handlerModule.default
      if (!handler) {
        return res.status(500).json({ error: `No handler export found in ${def.handler}` })
      }
      const event = makeLambdaEvent(req)
      const context = {}
      const result = await handler(event, context)
      if (result && typeof result === 'object' && 'statusCode' in result) {
        return res
          .status(result.statusCode)
          .set(result.headers || {})
          .send(result.body)
      } else {
        return res.json(result)
      }
    } catch (err) {
      return res.status(500).json({ error: err instanceof Error ? err.message : err })
    }
  })
  endpointRows.push(
    `${method.padEnd(6)}  http://localhost:3001${routePath.padEnd(40)}  ${def.handler}`
  )
}

// Dynamically import chalk only for local dev output
async function printLambdaEndpoints(endpointRows: string[]) {
  const chalk = (await import('chalk')).default
  if (endpointRows.length) {
    console.log(chalk.bold.magenta('\nRegistered Lambda Endpoints:'))

    console.log()

    console.log(
      chalk.gray('──────────────────────────────────────────────────────────────────────────────')
    )

    console.log(
      `${chalk.bold('METHOD')}  ${chalk.bold('URL'.padEnd(40))}  ${chalk.bold('HANDLER')}`
    )

    console.log(
      chalk.gray('──────────────────────────────────────────────────────────────────────────────')
    )

    endpointRows.forEach((row) => console.log(row))

    console.log(
      chalk.gray('──────────────────────────────────────────────────────────────────────────────\n')
    )
  }
}

printLambdaEndpoints(endpointRows)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Local Lambda server running at http://localhost:${PORT}`)
})
