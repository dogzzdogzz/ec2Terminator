<!--
title: 'ec2Terminator in node.js'
description: 'This AWS lambda function will terminate AWS EC2 instance daily when the last commit of specific github repository:branch is older than 3 days.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorName: 'Tony Lee'
-->
# ec2Terminator
This AWS lambda function will terminate AWS EC2 instance daily when the last commit of specific github repository:branch is older than 3 days.

## Prerequisites

- AWS Lambda
- AWS Cloudwatch
- AWS IAM
- AWS CloudFormation
- Serverless Framework

### Installing the Serverless Framework ###

```bash
npm -g install serverless
```
[Setting up AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/)


Check out [Serverless guide](https://serverless.com/framework/docs/providers/aws/) to learn more about Serverless Framework

## AWS EC2 Instance

The following tags are required when launching AWS EC2 Instance for ec2Terminator to check the most recent commit time of specific github repository:branch

```bash
serverType: <ServerType>
repoOwner: <GithubRepositoryOwnerName>
repoName: <GithubRepositoryName>
featureBranch: <BranchName>
```

## Configuration
To change AWS region, modify region in serverless.yml
```bash
provider:
  region: us-west-2
```
To change serverType tag filter, modify SERVER_TYPE in serverless.yml 
```bash
provider:
  environment:
    SERVER_TYPE: dev
```

## Deploy

In order to deploy ec2Terminator, simply run:

```bash
npm install
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (1.7 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.....................
Serverless: Stack update finished...
Service Information
service: sls-ec2Terminator
stage: dev
region: us-west-2
stack: sls-ec2Terminator-dev
api keys:
  None
endpoints:
  None
functions:
  ec2Terminator: sls-ec2Terminator-dev-ec2Terminator
```

## Usage

You can now invoke the Lambda directly and even see the resulting log via

```bash
serverless invoke --function ec2Terminator --log
```

Frequently invoking ec2Terminator might be failed if exceeding github API rate limit, check out [Github API rate limit](https://developer.github.com/v3/rate_limit/) for the detail.