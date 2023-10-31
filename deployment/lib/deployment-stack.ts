import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { OriginAccessIdentity, Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, RecordTarget, HostedZone, AaaaRecord } from 'aws-cdk-lib/aws-route53';
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

    // Ensure that cloudfront distribution updates after bucket deployment
    const distribution = new Distribution(this, 'FiftyOneFiftyDistribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity: oai
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      certificate,
      domainNames: [hostedZoneName],
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.seconds(0)
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.seconds(0)
        }
      ]
    })

    const hostedZone = HostedZone.fromLookup(this, 'FiftyOneFiftyHostedZone', {
      domainName: hostedZoneName
    })

    new ARecord(this, 'FiftyOneFiftyARecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: hostedZoneName
    })

    new AaaaRecord(this, 'FiftyOneFiftyAaaaRecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: hostedZoneName
    })
  }
}
