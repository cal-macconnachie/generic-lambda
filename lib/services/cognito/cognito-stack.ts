import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { aws_cognito as cognito } from 'aws-cdk-lib'

export interface CognitoStackProps extends cdk.StackProps {
  appName: string
  envName: string
}

export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool
  public readonly userPoolClient: cognito.UserPoolClient

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props)

    const { appName, envName } = props

    this.userPool = new cognito.UserPool(this, `UserPool-${envName}`, {
      userPoolName: `${appName}UserPool-${envName}`,
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      autoVerify: { email: true },
      standardAttributes: { email: { required: true, mutable: false } }
    })
    this.userPoolClient = new cognito.UserPoolClient(this, `${appName}UserPoolClient-${envName}`, {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: { userPassword: true, userSrp: true }
    })
  }
}
