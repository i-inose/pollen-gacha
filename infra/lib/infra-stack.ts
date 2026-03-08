import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as path from "path";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ======================
    // DynamoDB Tables
    // ======================

    // ガチャ結果テーブル
    const gachaResultsTable = new dynamodb.Table(this, "GachaResults", {
      tableName: "pollen-gacha-results",
      partitionKey: { name: "dateRegion", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "timestampNickname", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 花粉データテーブル
    const pollenDataTable = new dynamodb.Table(this, "PollenData", {
      tableName: "pollen-gacha-pollen-data",
      partitionKey: { name: "region", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "date", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ユーザーテーブル
    const usersTable = new dynamodb.Table(this, "Users", {
      tableName: "pollen-gacha-users",
      partitionKey: { name: "nickname", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ======================
    // S3 Bucket (キャラ画像)
    // ======================

    const imageBucket = new s3.Bucket(this, "CharacterImages", {
      bucketName: `pollen-gacha-images-${this.account}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // ======================
    // CloudFront (CDN)
    // ======================

    const distribution = new cloudfront.Distribution(this, "ImageCDN", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(imageBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
    });

    // ======================
    // Lambda Functions
    // ======================

    const lambdaDir = path.join(__dirname, "../lambda");

    // ガチャ実行Lambda
    const gachaFunction = new lambda.Function(this, "GachaFunction", {
      functionName: "pollen-gacha-execute",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "gacha.handler",
      code: lambda.Code.fromAsset(lambdaDir),
      timeout: cdk.Duration.seconds(10),
      environment: {
        GACHA_RESULTS_TABLE: gachaResultsTable.tableName,
        USERS_TABLE: usersTable.tableName,
        POLLEN_DATA_TABLE: pollenDataTable.tableName,
      },
    });

    // ランキング取得Lambda
    const rankingFunction = new lambda.Function(this, "RankingFunction", {
      functionName: "pollen-gacha-ranking",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "ranking.handler",
      code: lambda.Code.fromAsset(lambdaDir),
      timeout: cdk.Duration.seconds(10),
      environment: {
        GACHA_RESULTS_TABLE: gachaResultsTable.tableName,
      },
    });

    // 花粉データ取得Lambda
    const pollenFunction = new lambda.Function(this, "PollenFunction", {
      functionName: "pollen-gacha-pollen",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "pollen.handler",
      code: lambda.Code.fromAsset(lambdaDir),
      timeout: cdk.Duration.seconds(10),
      environment: {
        POLLEN_DATA_TABLE: pollenDataTable.tableName,
      },
    });

    // ユーザー登録 / 統計Lambda
    const userFunction = new lambda.Function(this, "UserFunction", {
      functionName: "pollen-gacha-user",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "user.handler",
      code: lambda.Code.fromAsset(lambdaDir),
      timeout: cdk.Duration.seconds(10),
      environment: {
        USERS_TABLE: usersTable.tableName,
      },
    });

    // 花粉データ日次更新Lambda
    const pollenUpdaterFunction = new lambda.Function(this, "PollenUpdater", {
      functionName: "pollen-gacha-pollen-updater",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "pollenUpdater.handler",
      code: lambda.Code.fromAsset(lambdaDir),
      timeout: cdk.Duration.seconds(30),
      environment: {
        POLLEN_DATA_TABLE: pollenDataTable.tableName,
      },
    });

    // DynamoDB権限付与
    gachaResultsTable.grantReadWriteData(gachaFunction);
    gachaResultsTable.grantReadData(rankingFunction);
    pollenDataTable.grantReadData(gachaFunction);
    pollenDataTable.grantReadData(pollenFunction);
    pollenDataTable.grantReadWriteData(pollenUpdaterFunction);
    usersTable.grantReadWriteData(gachaFunction);
    usersTable.grantReadWriteData(userFunction);

    // ======================
    // API Gateway
    // ======================

    const api = new apigateway.RestApi(this, "PollenGachaApi", {
      restApiName: "pollen-gacha-api",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type"],
      },
    });

    // /api/gacha (POST)
    const gachaResource = api.root.addResource("gacha");
    gachaResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(gachaFunction)
    );

    // /api/ranking (GET)
    const rankingResource = api.root.addResource("ranking");
    rankingResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(rankingFunction)
    );

    // /api/pollen (GET)
    const pollenResource = api.root.addResource("pollen");
    pollenResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(pollenFunction)
    );

    // /api/user (POST + GET)
    const userResource = api.root.addResource("user");
    userResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(userFunction)
    );
    userResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(userFunction)
    );

    // ======================
    // EventBridge (日次花粉データ更新)
    // ======================

    new events.Rule(this, "DailyPollenUpdate", {
      schedule: events.Schedule.cron({ minute: "0", hour: "0" }), // 毎日0時(UTC)
      targets: [new targets.LambdaFunction(pollenUpdaterFunction)],
    });

    // ======================
    // Outputs
    // ======================

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway URL",
    });

    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: `https://${distribution.distributionDomainName}`,
      description: "CloudFront Distribution URL for character images",
    });

    new cdk.CfnOutput(this, "ImageBucketName", {
      value: imageBucket.bucketName,
      description: "S3 Bucket for character images",
    });
  }
}
