import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';

export class DeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const distPath = 'src/docs/.vuepress/dist'

    const bucket = new Bucket(this, 'FiftyOneFiftyBucket', {
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      },
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    new BucketDeployment(this, 'FiftyOneFiftyBucketDeployment', {
      sources: [Source.asset(`../${distPath}`)],
      destinationBucket: bucket
    })

    const oai = new OriginAccessIdentity(this, 'FiftyOneFiftyOAI', {
      comment: 'FiftyOneFifty OAI'
    })
    bucket.grantRead(oai)

  }
}
