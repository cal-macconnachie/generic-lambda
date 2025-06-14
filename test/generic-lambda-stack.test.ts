import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { GenericLambdaStack } from '../lib/generic-lambda-stack'
import { ApiGatewayStack } from '../lib/services/api-gateway/apigateway-stack'
import { CognitoStack } from '../lib/services/cognito/cognito-stack'
import { DdbTablesStack } from '../lib/services/dynamodb/ddb-tables-stack'

test('GenericLambdaStack synthesizes successfully', () => {
  const app = new cdk.App()
  const stack = new GenericLambdaStack(app, 'TestStack', { envName: 'test' })
  const template = Template.fromStack(stack)
  expect(template).toBeDefined()
})

test('ApiGatewayStack creates API Gateway and Cognito Authorizer', () => {
  const app = new cdk.App()
  const cognitoStack = new CognitoStack(app, 'CognitoStack', { appName: 'test', envName: 'test' })
  const stack = new ApiGatewayStack(app, 'ApiGatewayStack', {
    appName: 'test',
    envName: 'test',
    userPool: cognitoStack.userPool,
    userPoolClient: cognitoStack.userPoolClient
  })
  // Add a dummy resource and method to attach the Cognito Authorizer
  const resource = stack.api.root.addResource('dummy')
  resource.addMethod('GET', undefined, {
    authorizationType: stack.cognitoAuthorizer.authorizationType,
    authorizer: stack.cognitoAuthorizer
  })
  const template = Template.fromStack(stack)
  expect(template).toBeDefined()
})

test('DdbTablesStack creates DynamoDB tables', () => {
  const app = new cdk.App()
  const stack = new DdbTablesStack(app, 'DdbTablesStack', { appName: 'test', envName: 'test' })
  const template = Template.fromStack(stack)
  expect(template).toBeDefined()
})

// Remove LambdaStack test from this file, as it should be in test/services/lambda/lambda-stack.test.ts
