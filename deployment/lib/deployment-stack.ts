import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { OriginAccessIdentity, Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, RecordTarget, HostedZone } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';

export class DeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const distPath = 'src/docs/.vuepress/dist'
    const certificate = Certificate.fromCertificateArn(this, 'FiftyOneFiftyCertificate', `arn:aws:acm:us-east-1:${this.account}:certificate/e2c31c19-7d2e-4009-882e-0fc10730238d`)
    const hostedZoneName = 'fiftyonefifty.dev'

    const bucket = new Bucket(this, 'FiftyOneFiftyBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
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

    const distribution = new Distribution(this, 'FiftyOneFiftyDistribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity: oai
        }),
      },
      enabled: true,
      defaultRootObject: 'index.html',
      domainNames: [hostedZoneName],
      certificate: certificate
    })

    new ARecord(this, 'FiftyOneFiftyARecord', {
      zone: HostedZone.fromLookup(this, 'FiftyOneFiftyHostedZone', {
        domainName: hostedZoneName
      }),
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: hostedZoneName
    })
  }
}
