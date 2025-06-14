import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn'

const sfnClient = new SFNClient({})
const stateMachineArn = process.env.STATE_MACHINE_ARN

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!stateMachineArn) {
    return { statusCode: 500, body: 'State machine ARN not configured' }
  }
  let input
  try {
    input = event.body ? JSON.parse(event.body) : {}
  } catch (e: unknown) {
    return { statusCode: 400, body: 'Invalid JSON in request body', e }
  }
  try {
    const result = await sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn,
        input: JSON.stringify(input)
      })
    )
    return {
      statusCode: 200,
      body: JSON.stringify({ executionArn: result.executionArn })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (err as Error).message })
    }
  }
}
