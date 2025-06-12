import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { aws_apigateway as apiGW } from 'aws-cdk-lib'
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito'

export interface ApiGatewayStackProps extends cdk.StackProps {
  appName: string
  envName: string
  userPool: UserPool
  userPoolClient: UserPoolClient
}

export class ApiGatewayStack extends cdk.Stack {
  public readonly api: apiGW.RestApi
  public readonly apiKey: apiGW.IApiKey
  public readonly usagePlan: apiGW.UsagePlan
  public readonly cognitoAuthorizer: apiGW.CognitoUserPoolsAuthorizer

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props)
    const { appName, envName, userPool } = props

    this.api = new apiGW.RestApi(this, `ApiGwEndpoint-${appName}-${envName}`, {
      restApiName: `${appName}-${envName}`,
      description: `API Gateway for Generic Lambda Stack in ${envName} environment`,
      deployOptions: { stageName: envName }
    })

    this.apiKey = this.api.addApiKey('ApiKey')
    this.usagePlan = this.api.addUsagePlan('UsagePlan', {
      name: 'DefaultUsagePlan',
      throttle: { rateLimit: 10, burstLimit: 2 }
    })
    this.usagePlan.addApiKey(this.apiKey)
    this.usagePlan.addApiStage({
      stage: this.api.deploymentStage
    })

    // Create Cognito Authorizer here
    this.cognitoAuthorizer = new apiGW.CognitoUserPoolsAuthorizer(
      this,
      `${appName}CognitoAuthorizer-${envName}`,
      {
        cognitoUserPools: [userPool],
        authorizerName: `${appName}CognitoAuthorizer-${envName}`
      }
    )
  }
}
