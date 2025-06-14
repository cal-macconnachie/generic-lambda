import { APIGatewayEvent } from 'aws-lambda'
import { initialHelper } from '../helpers/initial-helper'
export const handler = async (event: APIGatewayEvent) => {
  // Extract specific properties from the event object
  const { resource, path, httpMethod, headers, queryStringParameters, body } = event
  const helperMessage = initialHelper()
  const response = {
    resource,
    path,
    httpMethod,
    headers,
    queryStringParameters,
    body,
    helperMessage
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(response, null, 2)
  }
}
