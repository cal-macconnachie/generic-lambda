import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { aws_stepfunctions as sfn, aws_apigateway as apiGW } from 'aws-cdk-lib'
import { stepFunctionDefinitions } from './step-function-definitions'
import { LambdaStack, LambdaStackProps } from '../lambda/lambda-stack'
import { createDefaultNodejsFunction, addApiResourceWithApiKey } from '../lambda/lambda-defaults'
import * as path from 'node:path'

export interface StepFunctionsStackProps extends StackProps {
  appName: string
  envName: string
  lambdaStack: LambdaStack
}

export class StepFunctionsStack extends Stack {
  public readonly stateMachines: Record<string, sfn.StateMachine> = {}

  constructor(scope: Construct, id: string, props: StepFunctionsStackProps) {
    super(scope, id, props)
    const { appName, envName, lambdaStack } = props

    // HACK: Access LambdaStack constructor props via a property for cross-stack resource sharing
    // You may want to refactor LambdaStack to expose api and cognitoAuthorizer as public readonly properties
    // @ts-expect-error: accessing private property for cross-stack integration
    const lambdaStackProps: LambdaStackProps = lambdaStack.props
    const api = lambdaStackProps.api
    const cognitoAuthorizer = lambdaStackProps.cognitoAuthorizer

    for (const def of stepFunctionDefinitions) {
      const definition = def.build(lambdaStack)
      const stateMachine = new sfn.StateMachine(this, `${def.name}-${envName}`, {
        stateMachineName: `${def.name}-${appName}-${envName}`,
        definition,
        ...(def.description && { description: def.description })
      })
      this.stateMachines[def.name] = stateMachine

      // If initiator is present, create the initiator Lambda and API Gateway resource
      if (def.initiator) {
        // Create the Lambda function for the initiator
        const initiatorFn = createDefaultNodejsFunction(this, `${def.initiator.name}-${envName}`, {
          entry: path.join(__dirname, '../lambda/handlers/step-functions/initiator.ts'),
          functionName: `${def.initiator.name}-${appName}-${envName}`,
          description: def.initiator.description || `Initiator for ${def.name}`,
          environment: {
            STATE_MACHINE_ARN: stateMachine.stateMachineArn,
            NODE_ENV: envName
          }
        })
        // Grant permission to start execution
        stateMachine.grantStartExecution(initiatorFn)

        // Attach API Gateway resource and method
        const resource = api.root.addResource(def.initiator.path)
        const integration = new apiGW.LambdaIntegration(initiatorFn)
        // Enable CORS
        resource.addCorsPreflight({
          allowOrigins: apiGW.Cors.ALL_ORIGINS,
          allowMethods: ['POST'],
          allowHeaders: apiGW.Cors.DEFAULT_HEADERS
        })
        if (def.initiator.auth === 'apiKey') {
          addApiResourceWithApiKey(resource, integration, 'POST')
        } else if (def.initiator.auth === 'cognito') {
          resource.addMethod('POST', integration, {
            authorizationType: apiGW.AuthorizationType.COGNITO,
            authorizer: cognitoAuthorizer
          })
        } else {
          resource.addMethod('POST', integration)
        }
      }
    }
  }
}
