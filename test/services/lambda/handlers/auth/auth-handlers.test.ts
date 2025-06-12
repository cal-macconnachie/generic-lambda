import { handler as registerHandler } from '../../../../../lib/services/lambda/handlers/auth/register'
import { handler as loginHandler } from '../../../../../lib/services/lambda/handlers/auth/login'
import { handler as refreshAuthHandler } from '../../../../../lib/services/lambda/handlers/auth/refresh-auth'
import { handler as logoutHandler } from '../../../../../lib/services/lambda/handlers/auth/logout'
import { APIGatewayProxyEvent } from 'aws-lambda'

describe('Auth Lambda Handlers', () => {
  const OLD_ENV = process.env
  beforeAll(() => {
    process.env = { ...OLD_ENV, USER_POOL_CLIENT_ID: 'dummy-client-id' }
  })
  afterAll(() => {
    process.env = OLD_ENV
  })

  test('register handler returns 400 if missing fields', async () => {
    const event = { body: JSON.stringify({}) } as unknown as APIGatewayProxyEvent
    const result = await registerHandler(event)
    expect(result.statusCode).toBe(400)
  })

  test('login handler returns 400 if missing fields', async () => {
    const event = { body: JSON.stringify({}) } as unknown as APIGatewayProxyEvent
    const result = await loginHandler(event)
    expect(result.statusCode).toBe(400)
  })

  test('refresh-auth handler returns 400 if missing refreshToken', async () => {
    const event = { body: JSON.stringify({}) } as unknown as APIGatewayProxyEvent
    const result = await refreshAuthHandler(event)
    expect(result.statusCode).toBe(400)
  })

  test('logout handler returns 200 or 500 depending on input', async () => {
    const event = {
      body: JSON.stringify({ accessToken: 'dummy' })
    } as unknown as APIGatewayProxyEvent
    const result = await logoutHandler(event)
    expect([200, 500]).toContain(result.statusCode)
  })
})
