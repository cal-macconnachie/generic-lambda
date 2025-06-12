jest.mock('../../../../lib/services/lambda/helpers/initial-helper', () => ({
  initialHelper: jest.fn(() => 'helperMessage')
}))
import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from '../../../../lib/services/lambda/handlers/initial-function'

describe('Initial Function Lambda Handler', () => {
  test('initial-function handler returns 200 and includes helperMessage', async () => {
    const event = {
      resource: '/',
      path: '/',
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: {},
      body: null
    } as unknown as APIGatewayProxyEvent
    const result = await handler(event)
    expect(result.statusCode).toBe(200)
    const responseBody = JSON.parse(result.body)
    expect(responseBody.helperMessage).toBe('helperMessage')
  })
})
