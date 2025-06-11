import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { create } from '../../helpers/dynamo-helpers/create'
import { v4 } from 'uuid'

const cognitoClient = new CognitoIdentityProviderClient({})
const USER_POOL_ID = process.env.USER_POOL_ID || ''
const AUTHED_USERS_TABLE = process.env.TABLE_AUTHED_USERS || 'authed-users'

export interface AuthedUser {
  email: string
  cognito_id: string
  username: string
  phone_number?: string
}

export const handler = async (event: APIGatewayProxyEvent) => {
  const { email, password, phone_number } = JSON.parse(event.body ?? '{}')
  const username = v4() // Use email as username
  if (!username || !email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Username, email, and password are required' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  }
  try {
    const command = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      UserAttributes: [{ Name: 'email', Value: email }],
      MessageAction: 'SUPPRESS' // Suppress the welcome email
    })
    const createUserResponse = await cognitoClient.send(command)

    const adminSetUserPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      Password: password,
      Permanent: true
    })
    await cognitoClient.send(adminSetUserPasswordCommand)

    // Extract Cognito user sub (id)
    const cognitoId = createUserResponse?.User?.Attributes?.find(
      (attr) => attr.Name === 'sub'
    )?.Value

    if (!cognitoId) {
      throw new Error('Failed to retrieve Cognito user sub')
    }

    // Insert user into authed-users DynamoDB table using helper
    await create<AuthedUser>({
      tableName: AUTHED_USERS_TABLE,
      key: { cognito_id: cognitoId },
      record: {
        email,
        username,
        phone_number,
        cognito_id: cognitoId
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User created successfully' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'User creation failed'
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    }
  }
}
