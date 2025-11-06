#!/bin/bash

# Deploy MyHomeBar backend without SAM CLI
# Uses AWS CloudFormation directly

set -e

echo "========================================="
echo "MyHomeBar Backend Deployment (No SAM)"
echo "========================================="
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

STACK_NAME="myhomebar"
REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "Region: $REGION"
echo "Account: $ACCOUNT_ID"
echo ""

# Create S3 bucket for Lambda code
BUCKET_NAME="myhomebar-deployment-${ACCOUNT_ID}"
echo "Creating deployment bucket: $BUCKET_NAME"

if ! aws s3 ls s3://$BUCKET_NAME 2>/dev/null; then
    if [ "$REGION" = "us-east-1" ]; then
        aws s3 mb s3://$BUCKET_NAME
    else
        aws s3 mb s3://$BUCKET_NAME --region $REGION
    fi
    echo "✓ Bucket created"
else
    echo "✓ Bucket already exists"
fi
echo ""

# Package backend code
echo "Packaging backend code..."
cd backend
npm install

# Create deployment package
rm -f deployment-package.zip
zip -r deployment-package.zip . -x "*.git*" -x "node_modules/.cache/*" > /dev/null
echo "✓ Backend packaged"
echo ""

# Upload to S3
echo "Uploading to S3..."
aws s3 cp deployment-package.zip s3://$BUCKET_NAME/
echo "✓ Uploaded"
echo ""

# Deploy CloudFormation stack
echo "Deploying CloudFormation stack..."
cd ../infrastructure

aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    CodeBucketName=$BUCKET_NAME \
  --region $REGION

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""

# Get outputs
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

echo "API Endpoint: $API_ENDPOINT"
echo ""
echo "Next steps:"
echo "1. Seed database: cd backend && node src/scripts/seed-database.js"
echo "2. Update Amplify with API endpoint: $API_ENDPOINT"
echo ""
