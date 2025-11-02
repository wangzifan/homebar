# AWS Amplify Deployment Guide

Deploy MyHomeBar to AWS Amplify for easy hosting with CI/CD.

## Prerequisites

1. **Deploy Backend First** (Lambda + DynamoDB)
   ```bash
   cd infrastructure
   sam build
   sam deploy --guided
   ```

2. **Get API Endpoint**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name myhomebar \
     --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
     --output text
   ```

3. **Seed Database**
   ```bash
   cd backend
   npm install
   export AWS_REGION=us-east-1
   export INVENTORY_TABLE=MyHomeBar-Inventory
   export RECIPES_TABLE=MyHomeBar-Recipes
   node src/scripts/seed-database.js
   ```

## Amplify Deployment

### Option 1: Deploy via Amplify Console (Recommended)

**Step 1: Push to GitHub**
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - MyHomeBar app"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/MyHomeBar.git
git branch -M main
git push -u origin main
```

**Step 2: Connect to Amplify**
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Choose "GitHub" and authorize
4. Select your MyHomeBar repository
5. Choose the `main` branch

**Step 3: Configure Build Settings**

Amplify should auto-detect the settings, but verify:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

**Step 4: Add Environment Variables**

In Amplify Console → App Settings → Environment variables, add:

```
VITE_USE_MOCK=false
VITE_API_URL=YOUR_API_ENDPOINT_HERE
```

Replace `YOUR_API_ENDPOINT_HERE` with the endpoint from prerequisites.

**Step 5: Deploy**
- Click "Save and deploy"
- Amplify will build and deploy your app
- You'll get a URL like: `https://main.xxxxx.amplifyapp.com`

### Option 2: Deploy via Amplify CLI

**Step 1: Install Amplify CLI**
```bash
npm install -g @aws-amplify/cli
amplify configure
```

**Step 2: Initialize Amplify**
```bash
amplify init
# Choose:
# - Name: myhomebar
# - Environment: prod
# - Editor: your choice
# - App type: javascript
# - Framework: react
# - Source directory: frontend/src
# - Build directory: frontend/dist
# - Build command: npm run build
# - Start command: npm run dev
```

**Step 3: Add Hosting**
```bash
amplify add hosting
# Choose:
# - Hosting with Amplify Console
# - Manual deployment
```

**Step 4: Configure Environment**
Create `frontend/.env.production`:
```
VITE_USE_MOCK=false
VITE_API_URL=YOUR_API_ENDPOINT_HERE
```

**Step 5: Publish**
```bash
amplify publish
```

## Build Configuration File

Create `amplify.yml` in the project root:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

## Environment Variables

Set these in Amplify Console (or `.env.production`):

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_USE_MOCK` | `false` | Use real backend |
| `VITE_API_URL` | Your API endpoint | From CloudFormation outputs |

## Custom Domain (Optional)

**In Amplify Console:**
1. Go to App Settings → Domain management
2. Click "Add domain"
3. Enter your domain (e.g., `myhomebar.com`)
4. Follow DNS verification steps
5. Amplify will provision SSL certificate automatically

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` triggers a new build
- Pull requests get preview deployments
- Build logs available in Amplify Console

## Troubleshooting

### Build Fails: "Top-level await not available"

**Solution**: Already fixed in the code! Make sure you have the latest version:
- `frontend/src/services/index.js` - Uses regular imports (no await)
- `frontend/vite.config.js` - Has `target: 'es2015'`

### Build Fails: "Cannot find module"

**Solution**: Check build settings point to correct directory:
```yaml
baseDirectory: frontend/dist  # Not just 'dist'
```

### CORS Errors After Deployment

**Solution**:
1. Verify API endpoint in environment variables
2. Check Lambda CORS headers are set
3. Clear browser cache and try again

### Environment Variables Not Working

**Solution**:
1. Prefix with `VITE_` (required for Vite)
2. Rebuild app after changing variables
3. Check they appear in build logs

### App Shows "No API URL configured"

**Solution**:
1. Set `VITE_API_URL` in Amplify environment variables
2. Redeploy the application
3. Check browser console for actual API calls

## Production Checklist

Before going live:

- [ ] Backend deployed to AWS
- [ ] Database seeded with recipes
- [ ] API endpoint configured in Amplify
- [ ] `VITE_USE_MOCK=false` set
- [ ] Build succeeds in Amplify
- [ ] Test all features in production
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

## Cost Estimate

**Amplify Hosting:**
- Build minutes: $0.01/minute
- Storage: $0.023/GB/month
- Data transfer: $0.15/GB
- **Estimated**: $0-5/month for personal use

**Backend (Lambda + DynamoDB):**
- See main DEPLOYMENT.md
- **Estimated**: $2-5/month

**Total**: ~$2-10/month depending on usage

## Alternative: Deploy to S3 + CloudFront

If you prefer the original S3 deployment:

```bash
# Use the automated script
./deploy.sh
```

This deploys frontend to S3 instead of Amplify.

## Getting Help

- **Build logs**: Check Amplify Console → Build logs
- **Runtime logs**: Check browser console
- **Backend logs**: CloudWatch Logs for Lambda functions
- **CORS issues**: See DEPLOYMENT.md troubleshooting section

## Next Steps After Deployment

1. Visit your Amplify URL
2. Test mood selection and recommendations
3. Add your real home bar inventory
4. Share with friends!
5. Set up custom domain (optional)

Happy deploying! 🚀
