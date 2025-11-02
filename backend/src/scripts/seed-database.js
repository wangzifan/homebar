#!/usr/bin/env node

/**
 * Seed script to populate DynamoDB tables with sample data
 *
 * Usage:
 *   node seed-database.js
 *
 * Prerequisites:
 *   - AWS credentials configured
 *   - DynamoDB tables created
 *   - Environment variables set or use defaults
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = process.env.INVENTORY_TABLE || 'MyHomeBar-Inventory';
const RECIPES_TABLE = process.env.RECIPES_TABLE || 'MyHomeBar-Recipes';

// Load sample data
const recipesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/sample-recipes.json'), 'utf8')
);
const inventoryData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/sample-inventory.json'), 'utf8')
);

// Add timestamps to data
const addTimestamps = (item) => {
  const now = new Date().toISOString();
  return {
    ...item,
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || now,
  };
};

// Seed recipes
async function seedRecipes() {
  console.log(`\nSeeding ${recipesData.length} recipes to ${RECIPES_TABLE}...`);

  for (const recipe of recipesData) {
    const recipeWithTimestamps = addTimestamps(recipe);

    try {
      await docClient.send(new PutCommand({
        TableName: RECIPES_TABLE,
        Item: recipeWithTimestamps,
      }));
      console.log(`✓ Added recipe: ${recipe.name}`);
    } catch (error) {
      console.error(`✗ Failed to add recipe ${recipe.name}:`, error.message);
    }
  }
}

// Seed inventory
async function seedInventory() {
  console.log(`\nSeeding ${inventoryData.length} inventory items to ${INVENTORY_TABLE}...`);

  for (const item of inventoryData) {
    const itemWithTimestamps = addTimestamps(item);

    try {
      await docClient.send(new PutCommand({
        TableName: INVENTORY_TABLE,
        Item: itemWithTimestamps,
      }));
      console.log(`✓ Added inventory: ${item.name}`);
    } catch (error) {
      console.error(`✗ Failed to add inventory ${item.name}:`, error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('======================================');
  console.log('MyHomeBar Database Seeding Script');
  console.log('======================================');
  console.log(`Recipes Table: ${RECIPES_TABLE}`);
  console.log(`Inventory Table: ${INVENTORY_TABLE}`);

  try {
    await seedRecipes();
    await seedInventory();

    console.log('\n======================================');
    console.log('✓ Database seeding completed successfully!');
    console.log('======================================');
  } catch (error) {
    console.error('\n======================================');
    console.error('✗ Database seeding failed:', error);
    console.error('======================================');
    process.exit(1);
  }
}

main();
