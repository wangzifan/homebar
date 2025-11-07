#!/bin/bash

# Script to add whiskeys to production DynamoDB
# Usage: ./add-whiskeys-to-prod.sh

REGION="us-west-2"
TABLE_NAME="MyHomeBar-Inventory"

echo "Adding whiskeys to production DynamoDB table: $TABLE_NAME"
echo "=========================================="

# Whiskey 1: Michter's US*1 Single Barrel Straight Rye
echo "Adding Michter's Rye..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-060"},
    "name": {"S": "Michter'\''s US*1 Single Barrel Straight Rye"},
    "category": {"S": "whiskey"},
    "quantity": {"N": "750"},
    "unit": {"S": "ml"},
    "brand": {"S": "Michter'\''s"},
    "purchaseDate": {"S": "2024-11-06"},
    "notes": {"S": "Single barrel rye whiskey"}
  }'

# Whiskey 2: The Balvenie Caribbean Cask 14 Year Old
echo "Adding The Balvenie 14..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-061"},
    "name": {"S": "The Balvenie Caribbean Cask 14 Year Old"},
    "category": {"S": "whiskey"},
    "quantity": {"N": "700"},
    "unit": {"S": "ml"},
    "brand": {"S": "The Balvenie"},
    "purchaseDate": {"S": "2024-11-06"},
    "notes": {"S": "14 year old single malt finished in Caribbean rum casks"}
  }'

# Whiskey 3: Redbreast Cask Strength 12 Year Old
echo "Adding Redbreast 12..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-062"},
    "name": {"S": "Redbreast Cask Strength 12 Year Old"},
    "category": {"S": "whiskey"},
    "quantity": {"N": "700"},
    "unit": {"S": "ml"},
    "brand": {"S": "Redbreast"},
    "purchaseDate": {"S": "2024-11-06"},
    "notes": {"S": "Cask strength Irish whiskey, 12 year old"}
  }'

# Whiskey 4: Kavalan Solist Vinho Barrique
echo "Adding Kavalan Vinho..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-063"},
    "name": {"S": "Kavalan Solist Vinho Barrique"},
    "category": {"S": "whiskey"},
    "quantity": {"N": "700"},
    "unit": {"S": "ml"},
    "brand": {"S": "Kavalan"},
    "purchaseDate": {"S": "2024-11-06"},
    "notes": {"S": "Taiwanese single malt finished in red wine casks"}
  }'

# Whiskey 5: Dewar's 20 Year Old Double Double
echo "Adding Dewar's 20..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-064"},
    "name": {"S": "Dewar'\''s 20 Year Old Double Double"},
    "category": {"S": "whiskey"},
    "quantity": {"N": "750"},
    "unit": {"S": "ml"},
    "brand": {"S": "Dewar'\''s"},
    "purchaseDate": {"S": "2024-11-06"},
    "notes": {"S": "20 year old blended Scotch whisky"}
  }'

echo "=========================================="
echo "✓ All 5 whiskeys have been added to production!"
