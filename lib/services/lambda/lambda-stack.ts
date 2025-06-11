import { Construct } from 'constructs'
import { aws_apigateway as apiGW, aws_iam, aws_dynamodb as dynamodb } from 'aws-cdk-lib'
import { createDefaultNodejsFunction, addApiResourceWithApiKey } from './lambda-defaults'
import * as path from 'node:path'
import { lambdaEndpointDefinitions } from './lambda-endpoint-definitions'

// Define a type for endpoint definitions
export interface LambdaEndpointDefinition {
  name: string
  path: string
  method: string
  handler: string
  description?: string
  environment?: string[]
  iamPolicies?: Array<{ actions: string[]; resources: string[] }>
  auth?: 'apiKey' | 'cognito' | 'none'
  tables?: string[] // List of DynamoDB table names this endpoint interacts with
  cors?: boolean // Enable CORS for this endpoint
}

export interface LambdaStackProps {
  api: apiGW.RestApi
  envVars: Record<string, string>
  cognitoAuthorizer?: apiGW.CognitoUserPoolsAuthorizer
  envName: string
  appName: string
  tables?: Record<string, dynamodb.Table>
}

export class LambdaStack extends Construct {
  public readonly lambdas: Record<string, unknown> = {}

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id)
    const { api, envVars, cognitoAuthorizer, envName, appName } = props
    const endpointDefs: LambdaEndpointDefinition[] = lambdaEndpointDefinitions

    for (const def of endpointDefs) {
      // Prepare environment variables, including table names if needed
      const lambdaEnv: Record<string, string> = {
        NODE_ENV: envName,
        ...def.environment?.reduce((acc: { [envKey: string]: string }, key: string) => {
          const value = envVars[key]
          if (value) {
            acc[key] = value
          } else {
            console.warn(`Environment variable ${key} is not set, skipping for ${def.name}`)
          }
          return acc
        }, {})
      }
      // Add table environment variables
      if (def.tables && props.tables) {
        for (const tableName of def.tables) {
          const table = props.tables[tableName]
          if (table) {
            // Environment variable name: TABLE_<TABLE_NAME>
            const envVarName = `TABLE_${tableName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
            lambdaEnv[envVarName] = table.tableName
          }
        }
      }
      const fn = createDefaultNodejsFunction(this, `${def.path}-${envName}`, {
        entry: path.join(__dirname, 'handlers', def.handler),
        functionName: `${def.name}-${appName}-${envName}`,
        description: def.description || `Lambda for ${def.path}`,
        environment: lambdaEnv
      })
      this.lambdas[def.name] = fn
      // Attach IAM policies if specified
      if (def.iamPolicies) {
        for (const policy of def.iamPolicies) {
          fn.addToRolePolicy(
            new aws_iam.PolicyStatement({
              actions: policy.actions,
              resources: policy.resources
            })
          )
        }
      }
      // Grant DynamoDB table access if specified
      if (def.tables && props.tables) {
        for (const tableName of def.tables) {
          const table = props.tables[tableName]
          if (table) {
            table.grantReadWriteData(fn)
          } else {
            console.warn(`Table ${tableName} not found for Lambda ${def.name}`)
          }
        }
      }
      const resource = api.root.addResource(def.path)
      const integration = new apiGW.LambdaIntegration(fn)
      // Enable CORS if specified
      if (def.cors) {
        resource.addCorsPreflight({
          allowOrigins: apiGW.Cors.ALL_ORIGINS,
          allowMethods: [def.method],
          allowHeaders: apiGW.Cors.DEFAULT_HEADERS
        })
      }
      if (def.auth === 'apiKey') {
        addApiResourceWithApiKey(resource, integration, def.method)
      } else if (def.auth === 'cognito') {
        resource.addMethod(def.method, integration, {
          authorizationType: apiGW.AuthorizationType.COGNITO,
          authorizer: cognitoAuthorizer
        })
      } else {
        resource.addMethod(def.method, integration)
      }
    }
  }
}
