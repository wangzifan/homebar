# MyHomeBar Deployment Guide

Complete guide to deploying MyHomeBar to AWS.

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```
3. **AWS SAM CLI** installed
   ```bash
   # macOS
   brew install aws-sam-cli

   # Windows (via installer)
   # Download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   ```
4. **Node.js 18+** installed
   ```bash
   node --version
   ```

## Quick Deployment

The easiest way to deploy is using the automated script:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
1. Install backend dependencies
2. Build and deploy AWS infrastructure
3. Seed the database with sample data (optional)
4. Build the frontend
5. Deploy frontend to S3

## Manual Deployment

If you prefer manual deployment or need more control:

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 2: Deploy Infrastructure

```bash
cd infrastructure
sam build
sam deploy --guided
```

During guided deployment, you'll be asked:
- **Stack Name**: `myhomebar` (or your choice)
- **AWS Region**: Your preferred region (e.g., `us-east-1`)
- **Confirm changes**: Yes
- **Allow SAM CLI IAM role creation**: Yes
- **Save arguments to configuration file**: Yes

### Step 3: Get API Endpoint

After deployment completes, get your API endpoint:

```bash
aws cloudformation describe-stacks \
  --stack-name myhomebar \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text
```

### Step 4: Seed Database (Optional)

Populate the database with sample recipes and inventory:

```bash
cd backend
export INVENTORY_TABLE=MyHomeBar-Inventory
export RECIPES_TABLE=MyHomeBar-Recipes
export AWS_REGION=us-east-1  # Your region

node src/scripts/seed-database.js
cd ..
```

### Step 5: Configure Frontend

Create a `.env` file in the frontend directory:

```bash
cd frontend
echo "VITE_API_URL=YOUR_API_ENDPOINT_HERE" > .env
```

Replace `YOUR_API_ENDPOINT_HERE` with the API endpoint from Step 3.

### Step 6: Build Frontend

```bash
npm install
npm run build
```

### Step 7: Deploy Frontend to S3

Get your S3 bucket name:

```bash
aws cloudformation describe-stacks \
  --stack-name myhomebar \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text
```

Upload frontend files:

```bash
aws s3 sync dist/ s3://YOUR_BUCKET_NAME/ --delete
```

### Step 8: Get Frontend URL

```bash
aws cloudformation describe-stacks \
  --stack-name myhomebar \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
  --output text
```

Visit this URL to access your application!

## Post-Deployment

### Testing the Application

1. **Visit the Frontend URL** from Step 8
2. **Navigate to Inventory** page
3. **Add some ingredients** if you didn't seed the database
4. **Go to Home** and select your mood
5. **Get recommendations** based on your inventory

### Monitoring

View Lambda function logs:

```bash
# Inventory function
sam logs -n MyHomeBar-Inventory --stack-name myhomebar --tail

# Recipes function
sam logs -n MyHomeBar-Recipes --stack-name myhomebar --tail

# Recommendations function
sam logs -n MyHomeBar-Recommendations --stack-name myhomebar --tail
```

### Updating the Application

#### Update Backend

```bash
cd infrastructure
sam build
sam deploy
```

#### Update Frontend

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET_NAME/ --delete
```

## Using CloudFront (Optional but Recommended)

For better performance and HTTPS support:

1. **Create CloudFront Distribution**:
   - Origin: Your S3 bucket website endpoint
   - Default Root Object: `index.html`
   - Error Pages: 404 → `/index.html` (for React Router)

2. **Update Frontend API URL**:
   ```bash
   echo "VITE_API_URL=YOUR_API_ENDPOINT" > frontend/.env
   ```

3. **Rebuild and deploy**:
   ```bash
   cd frontend
   npm run build
   aws s3 sync dist/ s3://YOUR_BUCKET_NAME/ --delete

   # Invalidate CloudFront cache
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DISTRIBUTION_ID \
     --paths "/*"
   ```

## Custom Domain (Optional)

To use a custom domain:

1. **Register domain** in Route 53 or your DNS provider
2. **Create SSL certificate** in AWS Certificate Manager
3. **Configure CloudFront** with custom domain and certificate
4. **Update DNS** records to point to CloudFront

## Costs

Expected monthly costs (with minimal usage):

- **DynamoDB**: ~$1-2/month (5 RCU/WCU provisioned)
- **Lambda**: Free tier covers most personal use
- **API Gateway**: ~$3.50 per million requests (free tier: 1M requests/month)
- **S3**: ~$0.50/month for hosting
- **Total**: ~$2-5/month (depending on usage)

### Cost Optimization

To reduce costs:

1. **Switch to On-Demand DynamoDB** if usage is very low
2. **Use CloudFront** for better S3 cost efficiency
3. **Clean up unused resources** regularly

## Cleanup

To delete all resources and avoid charges:

```bash
# Delete S3 bucket contents first
aws s3 rm s3://YOUR_BUCKET_NAME/ --recursive

# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name myhomebar

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name myhomebar
```

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that API endpoint is correct in `.env`
2. Verify Lambda functions have CORS headers enabled
3. Redeploy the infrastructure

### Database Connection Issues

1. Check DynamoDB tables exist:
   ```bash
   aws dynamodb list-tables
   ```
2. Verify Lambda functions have DynamoDB permissions
3. Check CloudWatch logs for errors

### Frontend Not Loading

1. Verify S3 bucket policy allows public read
2. Check bucket website configuration
3. Clear browser cache
4. Check browser console for errors

### Lambda Timeout

If recommendations are slow:
1. Increase Lambda timeout in `template.yaml`
2. Optimize database queries
3. Consider pagination for large datasets

## Support

For issues or questions:
1. Check CloudWatch logs for Lambda functions
2. Review API Gateway logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
