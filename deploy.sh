#!/bin/bash

# MyHomeBar Deployment Script
# This script deploys the entire MyHomeBar application to AWS

set -e

echo "========================================="
echo "MyHomeBar Deployment Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

if ! command -v sam &> /dev/null; then
    echo -e "${RED}✗ AWS SAM CLI not found. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS SAM CLI found${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

echo ""
echo "========================================="
echo "Step 1: Installing Backend Dependencies"
echo "========================================="
cd backend
npm install
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

echo ""
echo "========================================="
echo "Step 2: Building and Deploying Infrastructure"
echo "========================================="
cd infrastructure
sam build
sam deploy --guided
cd ..
echo -e "${GREEN}✓ Infrastructure deployed${NC}"

echo ""
echo "========================================="
echo "Step 3: Getting API Endpoint"
echo "========================================="
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name myhomebar \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text 2>/dev/null || echo "")

if [ -z "$API_ENDPOINT" ]; then
    echo -e "${YELLOW}⚠ Could not automatically retrieve API endpoint${NC}"
    echo "Please manually get it from CloudFormation outputs"
else
    echo -e "${GREEN}✓ API Endpoint: $API_ENDPOINT${NC}"

    # Create .env file for frontend
    echo "VITE_API_URL=$API_ENDPOINT" > frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env with API endpoint${NC}"
fi

echo ""
echo "========================================="
echo "Step 4: Seeding Database"
echo "========================================="
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    node src/scripts/seed-database.js
    cd ..
    echo -e "${GREEN}✓ Database seeded${NC}"
else
    echo -e "${YELLOW}⊘ Database seeding skipped${NC}"
fi

echo ""
echo "========================================="
echo "Step 5: Building Frontend"
echo "========================================="
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✓ Frontend built${NC}"

echo ""
echo "========================================="
echo "Step 6: Deploying Frontend to S3"
echo "========================================="
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name myhomebar \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
    --output text 2>/dev/null || echo "")

if [ -z "$BUCKET_NAME" ]; then
    echo -e "${YELLOW}⚠ Could not automatically retrieve bucket name${NC}"
    echo "Please manually deploy frontend to S3"
else
    aws s3 sync frontend/dist/ s3://$BUCKET_NAME/ --delete
    echo -e "${GREEN}✓ Frontend deployed to S3${NC}"

    FRONTEND_URL=$(aws cloudformation describe-stacks \
        --stack-name myhomebar \
        --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
        --output text 2>/dev/null || echo "")

    if [ -n "$FRONTEND_URL" ]; then
        echo ""
        echo -e "${GREEN}=========================================${NC}"
        echo -e "${GREEN}Deployment Complete!${NC}"
        echo -e "${GREEN}=========================================${NC}"
        echo ""
        echo -e "Frontend URL: ${GREEN}$FRONTEND_URL${NC}"
        echo -e "API Endpoint: ${GREEN}$API_ENDPOINT${NC}"
        echo ""
    fi
fi

echo ""
echo "Next steps:"
echo "1. Visit your frontend URL to access the application"
echo "2. Add your own inventory items"
echo "3. Get personalized drink recommendations!"
echo ""
