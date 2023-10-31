#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DeploymentStack } from '../lib/deployment-stack';

const app = new cdk.App();
const env = {
  region: process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT,
  account: process.env.CDK_DEPLOY_REGION ?? process.env.CDK_DEFAULT_REGION
}

new DeploymentStack(app, 'DeploymentStack', {
  env: env
});
