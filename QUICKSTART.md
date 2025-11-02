# MyHomeBar Quick Start Guide

Get your personal bartender up and running in minutes!

## Prerequisites

Install these if you don't have them:

```bash
# Check if installed
node --version    # Should be 18+
aws --version     # AWS CLI
sam --version     # AWS SAM CLI
```

If not installed:
- **Node.js**: https://nodejs.org/
- **AWS CLI**: https://aws.amazon.com/cli/
- **AWS SAM**: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

## Configure AWS

```bash
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

## Deploy Everything

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
1. Install dependencies
2. Deploy to AWS
3. Seed sample data (if you choose yes)
4. Build frontend
5. Deploy to S3
6. Show you the URL to access your app

## Access Your App

After deployment completes, visit the Frontend URL shown in the output.

## First Steps

1. **Home Page**: Select your mood (e.g., "Refreshing", "Strong")
2. **Get Recommendations**: Click to see top 3 drink suggestions
3. **Inventory Page**: Add/update your actual ingredients
4. **Try Again**: Get new recommendations with your real inventory

## Sample Data Included

If you chose to seed the database, you'll have:
- **12 Popular Recipes**: Martini, Mojito, Old Fashioned, etc.
- **24 Inventory Items**: Gin, Vodka, Rum, Mixers, Fresh Fruits, etc.

## What Each Page Does

### Home (Welcome Page)
Select your current mood or preferences:
- Lazy → No mixing required (wine, whiskey neat)
- Sparkling → Bubbly drinks
- Warm → Hot drinks
- Light → Low-ABV refreshing
- Strong → Spirit-forward
- Sweet → Fruity drinks
- Sour → Citrus-based
- Refreshing → Cool and crisp

### Recommendations Page
Shows top 3 drinks based on:
- Your selected mood
- Available ingredients in inventory
- Difficulty and preparation time
- Missing ingredients highlighted

### Inventory Page
Manage your home bar:
- Add new items with quantities
- Set expiration dates (for fruits/mixers)
- Edit existing items
- Delete items
- Organized by category

## Cost Estimate

Expected monthly cost: **$2-5** for personal use

- Most services stay in AWS free tier
- DynamoDB: ~$1-2/month (5 RCU/WCU)
- Lambda: Free for personal use
- S3: ~$0.50/month

## Cleanup

To delete everything and stop charges:

```bash
# Delete S3 bucket contents
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name myhomebar \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

aws s3 rm s3://$BUCKET/ --recursive

# Delete stack
aws cloudformation delete-stack --stack-name myhomebar
```

## Troubleshooting

### "No recipes found"
- Make sure you ran the seed script
- Check CloudWatch logs for Lambda errors
- Verify DynamoDB tables exist in AWS Console

### CORS errors
- Verify `.env` file has correct API endpoint
- Redeploy if needed: `cd infrastructure && sam deploy`

### Can't access website
- Check S3 bucket is public (see DEPLOYMENT.md)
- Clear browser cache
- Try incognito/private mode

## Next Steps

1. **Add Your Own Recipes**: Use Inventory page to add custom drinks
2. **Update Inventory**: Replace sample data with your actual bar
3. **Try Different Moods**: Experiment with combinations
4. **Share**: Send the URL to friends for party planning

## Get Help

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Database Schema**: See `backend/DATABASE_SCHEMA.md`
- **AWS Console**: Check CloudWatch logs for errors
- **Browser Console**: Check for frontend errors

Enjoy your personal bartender! 🍸
