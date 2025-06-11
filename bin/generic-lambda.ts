#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { GenericLambdaStack } from '../lib/generic-lambda-stack'

const app = new cdk.App()

const envName = app.node.tryGetContext('envName') || 'dev'

new GenericLambdaStack(app, `GenericLambdaStack-${envName}`, {
  envName
  /* Optionally set AWS env here */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
