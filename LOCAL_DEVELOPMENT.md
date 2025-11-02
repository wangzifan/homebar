# Local Development Guide

Three ways to run MyHomeBar locally:

## Option 1: Mock Backend (Fastest - No AWS Required)

Perfect for frontend development without needing AWS backend.

**Step 1: Switch to Mock API**

Edit `frontend/src/pages/Welcome.jsx`, `Recommendations.jsx`, and `Inventory.jsx`:

Change:
```javascript
import { recommendationsApi } from '../services/api';
```

To:
```javascript
import { recommendationsApi } from '../services/mockApi';
```

Do this for all three pages (or create a config switch).

**Step 2: Run Frontend**
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

**Benefits:**
- No AWS account needed
- Instant startup
- Data persists in memory (resets on refresh)
- Sample data pre-loaded

---

## Option 2: Frontend + Deployed Backend (Recommended)

Develop frontend locally while using real AWS backend.

**Step 1: Deploy Backend Once**
```bash
cd infrastructure
sam build
sam deploy --guided
# Choose stack name: myhomebar
# Choose region: us-east-1 (or your preferred region)
# Accept defaults for other options
```

**Step 2: Seed Database**
```bash
cd backend
npm install

# Set environment variables
export AWS_REGION=us-east-1
export INVENTORY_TABLE=MyHomeBar-Inventory
export RECIPES_TABLE=MyHomeBar-Recipes

# Run seed script
node src/scripts/seed-database.js
```

**Step 3: Get API Endpoint**
```bash
aws cloudformation describe-stacks \
  --stack-name myhomebar \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text
```

**Step 4: Configure Frontend**
```bash
cd frontend

# Create .env file
cat > .env << EOF
VITE_API_URL=YOUR_API_ENDPOINT_HERE
EOF

# Install and run
npm install
npm run dev
```

Visit http://localhost:3000

**Benefits:**
- Real AWS services
- Persistent data storage
- Test actual deployment
- Frontend hot-reload during development

---

## Option 3: Fully Local with SAM Local

Run everything locally including Lambda functions.

**Step 1: Install Dependencies**
```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

**Step 2: Start Local API**

Terminal 1:
```bash
cd infrastructure
sam build
sam local start-api --port 3001
```

This starts the API at http://localhost:3001

**Note:** SAM Local still requires DynamoDB. You have two options:

### A. Use AWS DynamoDB (Hybrid)
Your Lambda runs locally but connects to real DynamoDB:
```bash
# Make sure tables exist in AWS
aws dynamodb list-tables

# Start SAM local (will use AWS DynamoDB)
sam local start-api --port 3001
```

### B. Use DynamoDB Local (Fully Local)
```bash
# Run DynamoDB Local via Docker
docker run -d -p 8000:8000 amazon/dynamodb-local

# Create local tables
aws dynamodb create-table \
  --table-name MyHomeBar-Inventory \
  --attribute-definitions \
    AttributeName=itemId,AttributeType=S \
  --key-schema AttributeName=itemId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000

aws dynamodb create-table \
  --table-name MyHomeBar-Recipes \
  --attribute-definitions \
    AttributeName=recipeId,AttributeType=S \
  --key-schema AttributeName=recipeId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000

# Update Lambda to use local DynamoDB (modify code to check environment)
```

**Step 3: Configure Frontend**

Terminal 2:
```bash
cd frontend
echo "VITE_API_URL=http://localhost:3001" > .env
npm run dev
```

Visit http://localhost:3000

**Benefits:**
- No AWS costs during development
- Test Lambda functions locally
- Full offline development

**Drawbacks:**
- More complex setup
- Slower cold starts
- DynamoDB Local setup required for fully offline

---

## Quick Comparison

| Feature | Mock Backend | Deployed Backend | SAM Local |
|---------|-------------|------------------|-----------|
| Setup Time | 1 min | 10 min | 15 min |
| AWS Required | No | Yes | Optional |
| Data Persistence | No | Yes | Depends |
| Cost | Free | $2-5/mo | Free |
| Best For | UI work | Full stack dev | Lambda testing |

---

## Recommended Workflow

1. **Start with Mock Backend** for initial UI development
2. **Switch to Deployed Backend** when testing real integration
3. **Use SAM Local** only when debugging Lambda functions

---

## Switching Between APIs

### Create a Config File

`frontend/src/services/config.js`:
```javascript
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK === 'true';

export { USE_MOCK_API };
```

`frontend/src/services/index.js`:
```javascript
import { USE_MOCK_API } from './config';
import * as realApi from './api';
import * as mockApi from './mockApi';

export const { inventoryApi, recipesApi, recommendationsApi } =
  USE_MOCK_API ? mockApi : realApi;
```

Then in your components:
```javascript
import { inventoryApi, recipesApi, recommendationsApi } from '../services';
```

Control with environment variable:
```bash
# Use mock
echo "VITE_USE_MOCK=true" > frontend/.env

# Use real API
echo "VITE_USE_MOCK=false" > frontend/.env
echo "VITE_API_URL=your-api-endpoint" >> frontend/.env
```

---

## Common Issues

### CORS Errors
- Make sure Lambda functions have CORS headers
- Check browser console for exact error
- Verify API endpoint is correct

### "Cannot read property 'data'"
- API response format mismatch
- Check network tab in browser
- Verify backend is running

### Lambda Function Not Found (SAM Local)
- Run `sam build` after code changes
- Check function names in template.yaml
- Verify Handler path is correct

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

---

## Development Tips

1. **Hot Reload**: Frontend changes auto-refresh
2. **Backend Changes**: Restart SAM local after Lambda changes
3. **Browser DevTools**: Use Network tab to debug API calls
4. **Console Logging**: Check both browser and terminal logs
5. **Data Reset**: Refresh page to reset mock data

Enjoy local development! 🚀
