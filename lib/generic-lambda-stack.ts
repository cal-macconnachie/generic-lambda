import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CognitoStack } from './services/cognito/cognito-stack'
import { DdbTablesStack } from './services/dynamodb/ddb-tables-stack'
import { LambdaStack } from './services/lambda/lambda-stack'
import { ApiGatewayStack } from './services/api-gateway/apigateway-stack'
import { StepFunctionsStack } from './services/step-functions/step-functions-stack'
import { appName as constantsAppName } from './constants'
export class GenericLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps & { envName?: string }) {
    super(scope, id, props)
    const envName = props?.envName || 'dev'
    let appName = constantsAppName
    if (envName === 'test') {
      appName = 'test'
    }
    if (!appName || appName.trim() === '') {
      throw new Error('appName must be defined in constants.ts')
    }

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
    const lambdaStack = new LambdaStack(this, `LambdaStack-${envName}`, {
      api,
      envVars,
      cognitoAuthorizer,
      envName,
      appName,
      tables: ddbTables.tables
    })
    // Build Step Functions using StepFunctionsStack
    new StepFunctionsStack(this, `StepFunctionsStack-${envName}`, {
      appName,
      envName,
      lambdaStack
    })
    // ADD any other resources or methods as needed below here -------------------------
  }
}
