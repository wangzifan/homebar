# Backend Setup Guide - Step by Step

Complete guide to set up the DynamoDB backend and Lambda functions.

## Prerequisites

```bash
# Check AWS credentials are configured
aws sts get-caller-identity

# Install AWS SAM CLI if not already installed
# macOS: brew install aws-sam-cli
# Windows: Download from AWS website
sam --version
```

## Step-by-Step Backend Deployment

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 2: Build the Backend

```bash
cd infrastructure
sam build

# You should see:
# Build Succeeded
# Built Artifacts  : .aws-sam/build
```

### Step 3: Deploy to AWS

```bash
sam deploy --guided
```

**Answer the prompts:**

```
Stack Name [myhomebar]: myhomebar
AWS Region [us-east-1]: us-east-1  (or your preferred region)
#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
Confirm changes before deploy [Y/n]: Y
#SAM needs permission to be able to create roles to connect to the resources in your template
Allow SAM CLI IAM role creation [Y/n]: Y
#Preserves the state of previously provisioned resources when an operation fails
Disable rollback [y/N]: N
MyHomeBarApi may not have authorization defined, Is this okay? [y/N]: y
InventoryFunction may not have authorization defined, Is this okay? [y/N]: y
RecipesFunction may not have authorization defined, Is this okay? [y/N]: y
RecommendationsFunction may not have authorization defined, Is this okay? [y/N]: y
Save arguments to configuration file [Y/n]: Y
SAM configuration file [samconfig.toml]: (press enter)
SAM configuration environment [default]: (press enter)
```

**Wait for deployment** (takes 2-3 minutes):
```
Successfully created/updated stack - myhomebar in us-east-1
```

### Step 4: Get Your API Endpoint

```bash
aws cloudformation describe-stacks \
  --stack-name myhomebar \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text
```

**Copy this URL!** It should look like:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
```

### Step 5: Verify Tables Were Created

```bash
aws dynamodb list-tables
```

You should see:
```json
{
    "TableNames": [
        "MyHomeBar-Inventory",
        "MyHomeBar-Recipes"
    ]
}
```

### Step 6: Seed the Database

```bash
cd backend

# Set environment variables
export AWS_REGION=us-east-1  # Use your region
export INVENTORY_TABLE=MyHomeBar-Inventory
export RECIPES_TABLE=MyHomeBar-Recipes

# Run the seed script
node src/scripts/seed-database.js
```

**Expected output:**
```
======================================
MyHomeBar Database Seeding Script
======================================
Recipes Table: MyHomeBar-Recipes
Inventory Table: MyHomeBar-Inventory

Seeding 12 recipes to MyHomeBar-Recipes...
✓ Added recipe: Whiskey Neat
✓ Added recipe: Classic Martini
✓ Added recipe: Mojito
...

Seeding 24 inventory items to MyHomeBar-Inventory...
✓ Added inventory: Tanqueray Gin
✓ Added inventory: Tito's Vodka
...

======================================
✓ Database seeding completed successfully!
======================================
```

### Step 7: Test the Backend API

Test that your API is working:

```bash
# Test inventory endpoint (should return empty or seeded items)
curl YOUR_API_ENDPOINT/inventory

# Test recipes endpoint
curl YOUR_API_ENDPOINT/recipes
```

You should get JSON responses with data.

### Step 8: Update Frontend Configuration

#### For Amplify Deployment:

Go to AWS Amplify Console:
1. Select your app
2. Go to **App Settings** → **Environment variables**
3. Add/Update these variables:

```
VITE_USE_MOCK=false
VITE_API_URL=YOUR_API_ENDPOINT_FROM_STEP_4
```

Example:
```
VITE_USE_MOCK=false
VITE_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

4. Click **Save**
5. Go to **App settings** → **Redeploy this version**

#### For S3 Deployment:

Update your local frontend:

```bash
cd frontend

# Create/update .env file
cat > .env << EOF
VITE_USE_MOCK=false
VITE_API_URL=YOUR_API_ENDPOINT_FROM_STEP_4
EOF

# Rebuild
npm run build

# Get S3 bucket name
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name myhomebar \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

# Deploy to S3
aws s3 sync dist/ s3://$BUCKET/ --delete
```

## Verify Everything Works

### Test Backend Directly

```bash
# List inventory
curl YOUR_API_ENDPOINT/inventory

# Get recommendations (should return top 3 drinks)
curl -X POST YOUR_API_ENDPOINT/recommendations \
  -H "Content-Type: application/json" \
  -d '{"moods": ["refreshing"]}'
```

### Test Frontend

1. Open your Amplify URL or S3 website URL
2. Open browser console (F12)
3. Should see: `🌐 Using Real API - YOUR_API_URL`
4. Go to Inventory page - should load items
5. Go to Home, select mood, get recommendations

## Troubleshooting

### Error: "Failed to load inventory"

**Check 1: Verify API endpoint is set**
```bash
# In browser console, you should see:
🌐 Using Real API - https://your-api-url.com/prod
```

If you see "No API URL configured", the environment variable isn't set.

**Check 2: Test API directly**
```bash
curl YOUR_API_ENDPOINT/inventory
```

If this fails, backend isn't deployed properly.

**Check 3: Check CORS**
Open browser Network tab:
- Look for failed requests to your API
- Check if CORS error in console
- Verify Lambda functions have CORS headers

**Check 4: Verify Lambda has DynamoDB permissions**
```bash
# Check Lambda function exists
aws lambda list-functions | grep MyHomeBar

# Check table exists
aws dynamodb describe-table --table-name MyHomeBar-Inventory
```

### Error: "AccessDeniedException"

Lambda doesn't have permission to access DynamoDB.

**Fix:**
```bash
cd infrastructure
sam deploy  # Redeploy with correct permissions
```

### Error: "Table does not exist"

Tables weren't created or wrong table name.

**Fix:**
```bash
# Check if tables exist
aws dynamodb list-tables

# If missing, redeploy
cd infrastructure
sam deploy
```

### Error: CORS blocking requests

**Fix:** Verify Lambda functions have CORS headers in `backend/src/functions/inventory.js`:

```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};
```

These are already in the code, but if you modified it, make sure they're there.

### Empty Inventory/Recipes

Database wasn't seeded.

**Fix:**
```bash
cd backend
export AWS_REGION=us-east-1
export INVENTORY_TABLE=MyHomeBar-Inventory
export RECIPES_TABLE=MyHomeBar-Recipes
node src/scripts/seed-database.js
```

## Viewing Logs

### Lambda Logs

```bash
# View inventory function logs
sam logs -n MyHomeBar-Inventory --stack-name myhomebar --tail

# View recipes function logs
sam logs -n MyHomeBar-Recipes --stack-name myhomebar --tail

# View recommendations function logs
sam logs -n MyHomeBar-Recommendations --stack-name myhomebar --tail
```

### In AWS Console

1. Go to CloudWatch
2. Select **Logs** → **Log groups**
3. Find `/aws/lambda/MyHomeBar-*`
4. View recent logs

## Manual Verification Checklist

- [ ] AWS credentials configured (`aws sts get-caller-identity` works)
- [ ] Backend deployed (`sam deploy` completed successfully)
- [ ] API Gateway endpoint obtained (starts with `https://`)
- [ ] DynamoDB tables exist (`aws dynamodb list-tables`)
- [ ] Database seeded (seed script ran successfully)
- [ ] Frontend has correct API URL in environment variables
- [ ] Frontend rebuilt and redeployed after setting API URL
- [ ] CORS headers present in Lambda functions
- [ ] Lambda functions have DynamoDB permissions

## Cost Information

**DynamoDB:**
- Free tier: 25 GB storage, 25 RCU/WCU
- After free tier: ~$1-2/month with provisioned capacity (5 RCU/WCU)

**Lambda:**
- Free tier: 1M requests/month, 400,000 GB-seconds compute
- After free tier: $0.20 per 1M requests

**API Gateway:**
- Free tier: 1M requests/month
- After free tier: $3.50 per 1M requests

**Expected monthly cost for personal use: $0-5**

## Next Steps

Once backend is working:
1. Test all features in production
2. Verify recommendations work
3. Add your real inventory items
4. Customize recipes
5. Share with friends!

## Quick Reference

```bash
# Deploy backend
cd infrastructure && sam build && sam deploy

# Get API endpoint
aws cloudformation describe-stacks \
  --stack-name myhomebar \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text

# Seed database
cd backend
export AWS_REGION=us-east-1
export INVENTORY_TABLE=MyHomeBar-Inventory
export RECIPES_TABLE=MyHomeBar-Recipes
node src/scripts/seed-database.js

# Test API
curl YOUR_API_ENDPOINT/inventory
curl YOUR_API_ENDPOINT/recipes

# View logs
sam logs -n MyHomeBar-Inventory --stack-name myhomebar --tail
```
