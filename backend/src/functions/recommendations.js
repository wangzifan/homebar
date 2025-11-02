const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = process.env.INVENTORY_TABLE || 'MyHomeBar-Inventory';
const RECIPES_TABLE = process.env.RECIPES_TABLE || 'MyHomeBar-Recipes';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

const createResponse = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

// Normalize ingredient names for matching
const normalizeIngredientName = (name) => {
  return name.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    // Generic spirit matching
    .replace(/\b(gin|vodka|rum|tequila|whiskey|bourbon|scotch|brandy|cognac)\b.*/, '$1')
    .replace(/fresh\s+/, '')
    .replace(/\bjuice\b/, '')
    .replace(/\bsyrup\b/, '');
};

// Check if inventory has required ingredient
const hasIngredient = (inventory, requiredIngredient) => {
  const normalizedRequired = normalizeIngredientName(requiredIngredient);

  return inventory.some(item => {
    const normalizedItem = normalizeIngredientName(item.name);

    // Check for exact match or partial match
    if (normalizedItem === normalizedRequired ||
        normalizedItem.includes(normalizedRequired) ||
        normalizedRequired.includes(normalizedItem)) {

      // Check if item has sufficient quantity and not expired
      if (item.quantity && item.quantity > 0) {
        if (item.expirationDate) {
          const expDate = new Date(item.expirationDate);
          const now = new Date();
          return expDate >= now;
        }
        return true;
      }
    }
    return false;
  });
};

// Calculate match score for a recipe
const calculateMatchScore = (recipe, inventory, selectedMoods) => {
  let score = 0;
  let missingIngredients = [];
  let availableIngredients = [];

  // Check ingredient availability
  recipe.ingredients.forEach(ingredient => {
    if (hasIngredient(inventory, ingredient.name)) {
      availableIngredients.push(ingredient.name);
      score += 10; // Base score for having ingredient

      if (ingredient.optional) {
        score += 5; // Bonus for optional ingredients you have
      }
    } else {
      if (!ingredient.optional) {
        missingIngredients.push(ingredient.name);
        score -= 20; // Penalty for missing required ingredient
      }
    }
  });

  // Mood matching bonus
  if (recipe.moods && Array.isArray(recipe.moods)) {
    const moodMatches = recipe.moods.filter(mood =>
      selectedMoods.includes(mood.toLowerCase())
    ).length;
    score += moodMatches * 15; // Strong bonus for mood match
  }

  // Difficulty bonus (easier drinks score higher)
  if (recipe.difficulty === 'easy') score += 8;
  if (recipe.difficulty === 'medium') score += 5;

  // Preparation time bonus (faster drinks score higher)
  if (recipe.preparationTime <= 3) score += 10;
  else if (recipe.preparationTime <= 5) score += 5;

  // Calculate ingredient match percentage
  const totalIngredients = recipe.ingredients.length;
  const matchPercentage = totalIngredients > 0
    ? (availableIngredients.length / totalIngredients) * 100
    : 0;

  return {
    score,
    missingIngredients,
    availableIngredients,
    matchPercentage,
    canMake: missingIngredients.length === 0,
  };
};

// Get recommendations
const getRecommendations = async (selectedMoods, preferences = {}) => {
  try {
    // Fetch all inventory items
    const inventoryCommand = new ScanCommand({
      TableName: INVENTORY_TABLE,
    });
    const inventoryResult = await docClient.send(inventoryCommand);
    const inventory = inventoryResult.Items || [];

    // Fetch all recipes
    const recipesCommand = new ScanCommand({
      TableName: RECIPES_TABLE,
    });
    const recipesResult = await docClient.send(recipesCommand);
    const recipes = recipesResult.Items || [];

    if (recipes.length === 0) {
      return createResponse(200, {
        recommendations: [],
        message: 'No recipes found in database. Please add some recipes first.',
      });
    }

    // Normalize mood selections
    const normalizedMoods = selectedMoods.map(m => m.toLowerCase());

    // Score all recipes
    const scoredRecipes = recipes.map(recipe => {
      const matchData = calculateMatchScore(recipe, inventory, normalizedMoods);
      return {
        ...recipe,
        matchScore: matchData.score,
        missingIngredients: matchData.missingIngredients,
        availableIngredients: matchData.availableIngredients,
        matchPercentage: matchData.matchPercentage,
        canMake: matchData.canMake,
      };
    });

    // Sort by score (highest first)
    scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);

    // Get top 3 recommendations
    const top3 = scoredRecipes.slice(0, 3);

    return createResponse(200, {
      recommendations: top3,
      totalRecipes: recipes.length,
      inventoryItemsCount: inventory.items,
      selectedMoods: normalizedMoods,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return createResponse(500, { error: 'Failed to get recommendations' });
  }
};

// Main Lambda handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(event.body);
    const { moods, preferences } = body;

    if (!moods || !Array.isArray(moods) || moods.length === 0) {
      return createResponse(400, {
        error: 'Please provide at least one mood in the request body'
      });
    }

    return await getRecommendations(moods, preferences || {});
  } catch (error) {
    console.error('Handler error:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};
