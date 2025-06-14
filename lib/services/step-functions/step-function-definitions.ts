import { aws_stepfunctions as sfn } from 'aws-cdk-lib'
import { LambdaStack } from '../lambda/lambda-stack'
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { IFunction } from 'aws-cdk-lib/aws-lambda'

export interface StepFunctionInitiator {
  name: string
  path: string
  auth?: 'none' | 'apiKey' | 'cognito'
  description?: string
}

export interface StepFunctionDefinition {
  name: string
  description?: string
  build: (lambdaStack: LambdaStack) => sfn.IChainable
  initiator?: StepFunctionInitiator
}

export const stepFunctionDefinitions: StepFunctionDefinition[] = [
  {
    name: 'ExampleLoopStepFunction',
    description: 'Step function that starts, loops through logic until count is zero, then ends',
    build: (lambdaStack) => {
      const startTask = new LambdaInvoke(lambdaStack, 'Start', {
        lambdaFunction: lambdaStack.lambdas['sfnStart'] as IFunction,
        outputPath: '$.Payload'
      })

      const logicTask = new LambdaInvoke(lambdaStack, 'Logic', {
        lambdaFunction: lambdaStack.lambdas['sfnLogic'] as IFunction,
        outputPath: '$.Payload'
      })

      const endTask = new LambdaInvoke(lambdaStack, 'End', {
        lambdaFunction: lambdaStack.lambdas['sfnEnd'] as IFunction,
        outputPath: '$.Payload'
      })

      // Choice state to check if count is zero
      const loopChoice = new sfn.Choice(lambdaStack, 'IsCountZero')

      loopChoice.when(sfn.Condition.numberEquals('$.count', 0), endTask)
      loopChoice.otherwise(logicTask.next(loopChoice))

      // Chain: start -> choice
      return startTask.next(loopChoice)
    },
    initiator: {
      name: 'ExampleLoopStepFunctionInitiator',
      path: 'start-example-loop',
      auth: 'none',
      description: 'Initiate ExampleLoopStepFunction execution'
    }
  }
]
