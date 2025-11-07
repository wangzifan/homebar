#!/bin/bash

# Script to add all mixers to production DynamoDB
# Usage: ./add-mixers-to-prod.sh

REGION="us-west-2"
TABLE_NAME="MyHomeBar-Inventory"

echo "Adding mixers to production DynamoDB table: $TABLE_NAME"
echo "=========================================="

# Mixer 1: Tonic Water
echo "Adding Tonic Water..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-012"},
    "name": {"S": "Tonic Water"},
    "category": {"S": "mixers"},
    "quantity": {"N": "2000"},
    "unit": {"S": "ml"},
    "brand": {"S": "Fever-Tree"},
    "purchaseDate": {"S": "2024-10-28"},
    "expirationDate": {"S": "2026-04-28"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 2: Soda Water
echo "Adding Soda Water..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-013"},
    "name": {"S": "Soda Water"},
    "category": {"S": "mixers"},
    "quantity": {"N": "2000"},
    "unit": {"S": "ml"},
    "brand": {"S": "San Pellegrino"},
    "purchaseDate": {"S": "2024-10-28"},
    "expirationDate": {"S": "2026-04-28"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 3: Ginger Beer
echo "Adding Ginger Beer..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-014"},
    "name": {"S": "Ginger Beer"},
    "category": {"S": "mixers"},
    "quantity": {"N": "1000"},
    "unit": {"S": "ml"},
    "brand": {"S": "Fever-Tree"},
    "purchaseDate": {"S": "2024-10-25"},
    "expirationDate": {"S": "2026-02-25"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 4: Simple Syrup
echo "Adding Simple Syrup..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-017"},
    "name": {"S": "Simple Syrup"},
    "category": {"S": "mixers"},
    "quantity": {"N": "500"},
    "unit": {"S": "ml"},
    "purchaseDate": {"S": "2024-10-22"},
    "expirationDate": {"S": "2026-10-22"},
    "notes": {"S": "Homemade, keep refrigerated"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 5: Angostura Bitters
echo "Adding Angostura Bitters..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-022"},
    "name": {"S": "Angostura Bitters"},
    "category": {"S": "mixers"},
    "quantity": {"N": "200"},
    "unit": {"S": "ml"},
    "brand": {"S": "Angostura"},
    "purchaseDate": {"S": "2024-08-15"},
    "expirationDate": {"S": "2027-08-15"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 6: Honey
echo "Adding Honey..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-023"},
    "name": {"S": "Honey"},
    "category": {"S": "mixers"},
    "quantity": {"N": "350"},
    "unit": {"S": "ml"},
    "purchaseDate": {"S": "2024-09-10"},
    "expirationDate": {"S": "2027-09-10"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 7: Maraschino Cherries
echo "Adding Maraschino Cherries..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-024"},
    "name": {"S": "Maraschino Cherries"},
    "category": {"S": "mixers"},
    "quantity": {"N": "250"},
    "unit": {"S": "ml"},
    "brand": {"S": "Luxardo"},
    "purchaseDate": {"S": "2024-09-20"},
    "expirationDate": {"S": "2026-09-20"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 8: Pineapple Juice
echo "Adding Pineapple Juice..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-040"},
    "name": {"S": "Pineapple Juice"},
    "category": {"S": "mixers"},
    "quantity": {"N": "1000"},
    "unit": {"S": "ml"},
    "brand": {"S": "Dole"},
    "purchaseDate": {"S": "2024-11-01"},
    "expirationDate": {"S": "2026-05-01"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 9: Cranberry Juice
echo "Adding Cranberry Juice..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-041"},
    "name": {"S": "Cranberry Juice"},
    "category": {"S": "mixers"},
    "quantity": {"N": "1000"},
    "unit": {"S": "ml"},
    "brand": {"S": "Ocean Spray"},
    "purchaseDate": {"S": "2024-11-01"},
    "expirationDate": {"S": "2026-05-01"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 10: Orange Juice
echo "Adding Orange Juice..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-042"},
    "name": {"S": "Orange Juice"},
    "category": {"S": "mixers"},
    "quantity": {"N": "1000"},
    "unit": {"S": "ml"},
    "brand": {"S": "Tropicana"},
    "purchaseDate": {"S": "2024-11-01"},
    "expirationDate": {"S": "2026-05-01"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 11: Lemon Juice
echo "Adding Lemon Juice..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-043"},
    "name": {"S": "Lemon Juice"},
    "category": {"S": "mixers"},
    "quantity": {"N": "500"},
    "unit": {"S": "ml"},
    "brand": {"S": "ReaLemon"},
    "purchaseDate": {"S": "2024-10-28"},
    "expirationDate": {"S": "2026-04-28"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 12: Lime Juice
echo "Adding Lime Juice..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-044"},
    "name": {"S": "Lime Juice"},
    "category": {"S": "mixers"},
    "quantity": {"N": "500"},
    "unit": {"S": "ml"},
    "brand": {"S": "ReaLime"},
    "purchaseDate": {"S": "2024-10-28"},
    "expirationDate": {"S": "2026-04-28"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 13: Coconut Cream
echo "Adding Coconut Cream..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-045"},
    "name": {"S": "Coconut Cream"},
    "category": {"S": "mixers"},
    "quantity": {"N": "425"},
    "unit": {"S": "ml"},
    "brand": {"S": "Coco Lopez"},
    "purchaseDate": {"S": "2024-10-25"},
    "expirationDate": {"S": "2026-10-25"},
    "notes": {"S": "For Pina Colada"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 14: Grenadine
echo "Adding Grenadine..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-046"},
    "name": {"S": "Grenadine"},
    "category": {"S": "mixers"},
    "quantity": {"N": "375"},
    "unit": {"S": "ml"},
    "brand": {"S": "Small Hand Foods"},
    "purchaseDate": {"S": "2024-10-20"},
    "expirationDate": {"S": "2026-10-20"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 15: Orgeat Syrup
echo "Adding Orgeat Syrup..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-047"},
    "name": {"S": "Orgeat Syrup"},
    "category": {"S": "mixers"},
    "quantity": {"N": "375"},
    "unit": {"S": "ml"},
    "brand": {"S": "Monin"},
    "purchaseDate": {"S": "2024-10-22"},
    "expirationDate": {"S": "2026-10-22"},
    "notes": {"S": "Almond syrup for tiki drinks"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 16: Egg White
echo "Adding Egg White..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-048"},
    "name": {"S": "Egg White"},
    "category": {"S": "mixers"},
    "quantity": {"N": "12"},
    "unit": {"S": "count"},
    "brand": {"S": "Farm Fresh"},
    "purchaseDate": {"S": "2024-11-01"},
    "expirationDate": {"S": "2026-12-01"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 17: Coffee
echo "Adding Coffee..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-051"},
    "name": {"S": "Coffee"},
    "category": {"S": "mixers"},
    "quantity": {"N": "500"},
    "unit": {"S": "ml"},
    "brand": {"S": "Starbucks"},
    "purchaseDate": {"S": "2024-11-02"},
    "notes": {"S": "Ground coffee for brewing"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 18: Hot Chocolate Mix
echo "Adding Hot Chocolate Mix..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-052"},
    "name": {"S": "Hot Chocolate Mix"},
    "category": {"S": "mixers"},
    "quantity": {"N": "300"},
    "unit": {"S": "ml"},
    "brand": {"S": "Ghirardelli"},
    "purchaseDate": {"S": "2024-11-02"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 19: Heavy Cream
echo "Adding Heavy Cream..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-053"},
    "name": {"S": "Heavy Cream"},
    "category": {"S": "mixers"},
    "quantity": {"N": "500"},
    "unit": {"S": "ml"},
    "brand": {"S": "Organic Valley"},
    "purchaseDate": {"S": "2024-11-02"},
    "expirationDate": {"S": "2026-11-15"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 20: Brown Sugar
echo "Adding Brown Sugar..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-054"},
    "name": {"S": "Brown Sugar"},
    "category": {"S": "mixers"},
    "quantity": {"N": "200"},
    "unit": {"S": "ml"},
    "purchaseDate": {"S": "2024-11-02"},
    "notes": {"S": "For sweetening warm drinks"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 21: Whipped Cream
echo "Adding Whipped Cream..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-055"},
    "name": {"S": "Whipped Cream"},
    "category": {"S": "mixers"},
    "quantity": {"N": "250"},
    "unit": {"S": "ml"},
    "brand": {"S": "Reddi-wip"},
    "purchaseDate": {"S": "2024-11-02"},
    "expirationDate": {"S": "2026-12-01"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 22: Cinnamon Sticks
echo "Adding Cinnamon Sticks..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-056"},
    "name": {"S": "Cinnamon Sticks"},
    "category": {"S": "mixers"},
    "quantity": {"N": "10"},
    "unit": {"S": "count"},
    "brand": {"S": "McCormick"},
    "purchaseDate": {"S": "2024-11-02"},
    "notes": {"S": "For mulled wine and garnish"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 23: Star Anise
echo "Adding Star Anise..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-057"},
    "name": {"S": "Star Anise"},
    "category": {"S": "mixers"},
    "quantity": {"N": "8"},
    "unit": {"S": "count"},
    "brand": {"S": "McCormick"},
    "purchaseDate": {"S": "2024-11-02"},
    "notes": {"S": "Spice for mulled wine"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

# Mixer 24: Cloves
echo "Adding Cloves..."
aws dynamodb put-item \
  --region $REGION \
  --table-name $TABLE_NAME \
  --item '{
    "itemId": {"S": "inv-058"},
    "name": {"S": "Cloves"},
    "category": {"S": "mixers"},
    "quantity": {"N": "20"},
    "unit": {"S": "count"},
    "brand": {"S": "McCormick"},
    "purchaseDate": {"S": "2024-11-02"},
    "notes": {"S": "Whole cloves for mulled wine"},
    "createdAt": {"S": "2025-11-07T17:20:00.000Z"},
    "updatedAt": {"S": "2025-11-07T17:20:00.000Z"}
  }'

echo "=========================================="
echo "✓ All 24 mixers have been added to production!"
