import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { get } from '../../helpers/dynamo-helpers/get'
import { AuthedUser } from './register'
import { query } from '../../helpers/dynamo-helpers/query'

const cognitoClient = new CognitoIdentityProviderClient({})
const CLIENT_ID = process.env.USER_POOL_CLIENT_ID || ''

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Login event received:', event)
  const { body } = event
  console.log('Login event body:', body)
  const { username, password } = JSON.parse(body || '{}')
  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Username and password are required' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  }

  try {
    const { items } = await query<AuthedUser>({
      tableName: process.env.TABLE_AUTHED_USERS || 'authed-users',
      indexName: 'email-gsi',
      keyConditionExpression: '#email = :email',
      expressionAttributeNames: {
        '#email': 'email'
      },
      expressionAttributeValues: {
        ':email': username
      }
    })
    if (!(items.length > 0)) {
      throw new Error('[404] User not found')
    }
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: items[0].username, // Use email as username
        PASSWORD: password
      }
    })

    const response = await cognitoClient.send(command)

    // Decode the ID token to get the Cognito user sub (cognito_id)
    const idToken = response.AuthenticationResult?.IdToken
    let cognitoId: string | undefined
    if (idToken) {
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf-8'))
      cognitoId = payload.sub
    }

    let user: AuthedUser | undefined = undefined
    if (cognitoId) {
      user = await get<AuthedUser>({
        tableName: process.env.TABLE_AUTHED_USERS || 'authed-users',
        key: { cognito_id: cognitoId }
      })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Login successful',
        accessToken: response.AuthenticationResult?.AccessToken,
        idToken: response.AuthenticationResult?.IdToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
        user // include user object
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  } catch (error) {
    console.error('Error during login:', error)
    return {
      statusCode: 401,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Login failed' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  }
}
