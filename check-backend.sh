#!/bin/bash

# Backend Health Check Script
# Diagnoses common backend deployment issues

echo "========================================="
echo "MyHomeBar Backend Health Check"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

STACK_NAME="${STACK_NAME:-homebar}"
REGION="${AWS_REGION:-us-west-2}"

# Check 1: AWS Credentials
echo "1. Checking AWS Credentials..."
if aws sts get-caller-identity &> /dev/null; then
    ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✓ AWS credentials configured (Account: $ACCOUNT)${NC}"
else
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi
echo ""

# Check 2: CloudFormation Stack
echo "2. Checking CloudFormation Stack..."
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    STATUS=$(aws cloudformation describe-stacks \
      --stack-name $STACK_NAME \
      --region $REGION \
      --query 'Stacks[0].StackStatus' \
      --output text)
    echo -e "${GREEN}✓ Stack exists: $STATUS${NC}"
else
    echo -e "${RED}✗ Stack '$STACK_NAME' not found in region $REGION${NC}"
    echo "Deploy backend with: cd infrastructure && sam deploy --guided"
    exit 1
fi
echo ""

# Check 3: API Endpoint
echo "3. Checking API Gateway Endpoint..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text 2>/dev/null)

if [ -n "$API_ENDPOINT" ]; then
    echo -e "${GREEN}✓ API Endpoint: $API_ENDPOINT${NC}"
else
    echo -e "${RED}✗ API Endpoint not found${NC}"
    exit 1
fi
echo ""

# Check 4: DynamoDB Tables
echo "4. Checking DynamoDB Tables..."
TABLES=$(aws dynamodb list-tables --region $REGION --query 'TableNames' --output text)

if echo "$TABLES" | grep -q "MyHomeBar-Inventory"; then
    echo -e "${GREEN}✓ Inventory table exists${NC}"

    # Check item count
    COUNT=$(aws dynamodb scan --table-name MyHomeBar-Inventory --region $REGION --select COUNT --query 'Count' --output text)
    echo "  Items in Inventory table: $COUNT"
else
    echo -e "${RED}✗ Inventory table not found${NC}"
fi

if echo "$TABLES" | grep -q "MyHomeBar-Recipes"; then
    echo -e "${GREEN}✓ Recipes table exists${NC}"

    # Check item count
    COUNT=$(aws dynamodb scan --table-name MyHomeBar-Recipes --region $REGION --select COUNT --query 'Count' --output text)
    echo "  Items in Recipes table: $COUNT"

    if [ "$COUNT" -eq "0" ]; then
        echo -e "${YELLOW}  ⚠ Recipes table is empty. Run seed script:${NC}"
        echo "  cd backend && node src/scripts/seed-database.js"
    fi
else
    echo -e "${RED}✗ Recipes table not found${NC}"
fi
echo ""

# Check 5: Lambda Functions
echo "5. Checking Lambda Functions..."
FUNCTIONS=$(aws lambda list-functions --region $REGION --query 'Functions[?contains(FunctionName, `MyHomeBar`)].FunctionName' --output text)

if [ -n "$FUNCTIONS" ]; then
    for func in $FUNCTIONS; do
        echo -e "${GREEN}✓ Function exists: $func${NC}"
    done
else
    echo -e "${RED}✗ No MyHomeBar Lambda functions found${NC}"
fi
echo ""

# Check 6: Test API Endpoints
echo "6. Testing API Endpoints..."

echo -n "Testing /inventory endpoint... "
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/inventory_response.json "${API_ENDPOINT}inventory" 2>&1)
HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Success (HTTP 200)${NC}"
    ITEM_COUNT=$(cat /tmp/inventory_response.json | grep -o '"itemId"' | wc -l | tr -d ' ')
    echo "  Inventory items returned: $ITEM_COUNT"

    if [ "$ITEM_COUNT" -eq "0" ]; then
        echo -e "${YELLOW}  ⚠ Inventory is empty. Seed the database.${NC}"
    fi
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo "  Response: $(cat /tmp/inventory_response.json)"
fi

echo -n "Testing /recipes endpoint... "
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/recipes_response.json "${API_ENDPOINT}recipes" 2>&1)
HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Success (HTTP 200)${NC}"
    RECIPE_COUNT=$(cat /tmp/recipes_response.json | grep -o '"recipeId"' | wc -l | tr -d ' ')
    echo "  Recipes returned: $RECIPE_COUNT"

    if [ "$RECIPE_COUNT" -eq "0" ]; then
        echo -e "${YELLOW}  ⚠ No recipes found. Seed the database.${NC}"
    fi
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo "  Response: $(cat /tmp/recipes_response.json)"
fi
echo ""

# Summary
echo "========================================="
echo "Summary"
echo "========================================="
echo ""
echo "API Endpoint (use this in frontend):"
echo -e "${GREEN}$API_ENDPOINT${NC}"
echo ""

if [ -f "frontend/.env" ]; then
    echo "Current frontend/.env:"
    cat frontend/.env
    echo ""

    if ! grep -q "$API_ENDPOINT" frontend/.env 2>/dev/null; then
        echo -e "${YELLOW}⚠ frontend/.env doesn't contain the correct API endpoint${NC}"
        echo ""
        echo "Update frontend/.env with:"
        echo "VITE_USE_MOCK=false"
        echo "VITE_API_URL=$API_ENDPOINT"
    fi
else
    echo -e "${YELLOW}⚠ frontend/.env not found${NC}"
    echo ""
    echo "Create frontend/.env with:"
    echo "VITE_USE_MOCK=false"
    echo "VITE_API_URL=$API_ENDPOINT"
fi

echo ""
echo "Next Steps:"
echo "1. If tables are empty, run: cd backend && node src/scripts/seed-database.js"
echo "2. Update frontend/.env with the API endpoint above"
echo "3. Rebuild frontend: cd frontend && npm run build"
echo "4. Redeploy to Amplify or S3"
echo ""

# Cleanup
rm -f /tmp/inventory_response.json /tmp/recipes_response.json
