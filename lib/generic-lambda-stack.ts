import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CognitoStack } from './services/cognito/cognito-stack'
import { DdbTablesStack } from './services/dynamodb/ddb-tables-stack'
import { LambdaStack } from './services/lambda/lambda-stack'
import { ApiGatewayStack } from './services/apigateway/apigateway-stack'
import { appName } from './constants'
export class GenericLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps & { envName?: string }) {
    super(scope, id, props)
    const envName = props?.envName || 'dev'

    const ddbTables = new DdbTablesStack(this, `DdbTablesStack-${envName}`, { appName, envName })

    // Create Cognito resources first
    const cognitoStack = new CognitoStack(this, `CognitoStack-${envName}`, {
      appName,
      envName
    })

    // Create the API Gateway using ApiGatewayStack, passing Cognito resources
    const apiGatewayStack = new ApiGatewayStack(this, `ApiGatewayStack-${envName}`, {
      appName,
      envName,
      userPool: cognitoStack.userPool,
      userPoolClient: cognitoStack.userPoolClient
    })
    const api = apiGatewayStack.api
    const cognitoAuthorizer = apiGatewayStack.cognitoAuthorizer

    // Environment variables for Lambda functions
    const envVars: Record<string, string> = {
      USER_POOL_ID: cognitoStack.userPool.userPoolId,
      USER_POOL_CLIENT_ID: cognitoStack.userPoolClient.userPoolClientId,
      NODE_ENV: envName
    }

    // Build Lambdas and API resources using LambdaStack
    new LambdaStack(this, `LambdaStack-${envName}`, {
      api,
      envVars,
      cognitoAuthorizer,
      envName,
      appName,
      tables: ddbTables.tables
    })
    // ADD any other resources or methods as needed below here -------------------------
  }
}
