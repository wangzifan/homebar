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

    if (normalizedItem === normalizedRequired ||
        normalizedItem.includes(normalizedRequired) ||
        normalizedRequired.includes(normalizedItem)) {

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

// Check if recipe contains sparkling ingredient
const hasSparkling = (ingredients) => {
  const sparklingTerms = ['tonic', 'tonic water', 'club soda', 'soda water', 'sparkling wine',
                          'prosecco', 'champagne', 'cava', 'seltzer', 'ginger beer'];

  return ingredients.some(ing => {
    const name = ing.name.toLowerCase();
    return sparklingTerms.some(term => name.includes(term));
  });
};

// Check if recipe is hot/warm
const isHotDrink = (recipe) => {
  const hotTerms = ['hot', 'warm', 'toddy', 'irish coffee', 'mulled'];
  const recipeName = recipe.name.toLowerCase();
  const description = (recipe.description || '').toLowerCase();

  return hotTerms.some(term => recipeName.includes(term) || description.includes(term)) ||
         (recipe.temperature && recipe.temperature.toLowerCase() === 'hot');
};

// Check if recipe is truly light (low calorie)
const isLightDrink = (recipe, ingredients) => {
  const excludedDrinks = ['old fashioned', 'negroni', 'manhattan'];
  const recipeName = recipe.name.toLowerCase();

  // Exclude high-calorie classics
  if (excludedDrinks.some(excluded => recipeName.includes(excluded))) {
    return false;
  }

  // Check for light ingredients
  const lightTerms = ['light tonic', 'club soda', 'soda water', 'beer', 'tonic water', 'seltzer'];
  const hasLightIngredient = ingredients.some(ing => {
    const name = ing.name.toLowerCase();
    return lightTerms.some(term => name.includes(term));
  });

  // Or has low ABV
  const hasLowABV = recipe.abv && recipe.abv <= 15;

  return hasLightIngredient || hasLowABV || recipe.category === 'beer';
};

// Check if recipe is strong (ABV > 20%)
const isStrongDrink = (recipe) => {
  return recipe.abv && recipe.abv > 20;
};

// Check if recipe is sweet
const isSweetDrink = (ingredients) => {
  const sweetTerms = ['juice', 'syrup', 'simple syrup', 'chocolate', 'choco', 'mint liqueur',
                      'melon', 'liqueur', 'sweet', 'honey', 'sugar', 'agave'];

  return ingredients.some(ing => {
    const name = ing.name.toLowerCase();
    return sweetTerms.some(term => name.includes(term));
  });
};

// Calculate match score
const calculateMatchScore = (recipe, inventory) => {
  let score = 0;
  let missingIngredients = [];
  let availableIngredients = [];

  recipe.ingredients.forEach(ingredient => {
    if (hasIngredient(inventory, ingredient.name)) {
      availableIngredients.push(ingredient.name);
      score += 10;
      if (ingredient.optional) score += 5;
    } else {
      if (!ingredient.optional) {
        missingIngredients.push(ingredient.name);
        score -= 20;
      }
    }
  });

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

// Filter recipes based on mood rules
const filterByMood = (recipes, inventory, mood) => {
  switch (mood) {
    case 'lazy':
      // Return ALL whiskey and wine, organized by type
      return recipes.filter(recipe =>
        recipe.category === 'whiskey' ||
        recipe.category === 'wine' ||
        recipe.name.toLowerCase().includes('whiskey') ||
        recipe.name.toLowerCase().includes('wine')
      );

    case 'sparkling':
      // Must contain sparkling ingredients
      return recipes.filter(recipe => hasSparkling(recipe.ingredients));

    case 'warm':
      // Must be hot drinks
      return recipes.filter(recipe => isHotDrink(recipe));

    case 'light':
      // Low calorie, exclude Old Fashioned/Negroni
      return recipes.filter(recipe => isLightDrink(recipe, recipe.ingredients));

    case 'strong':
      // ABV > 20%
      return recipes.filter(recipe => isStrongDrink(recipe));

    case 'sweet':
      // Must have juice or sweet liqueur
      return recipes.filter(recipe => isSweetDrink(recipe.ingredients));

    case 'surprise-me':
      // Random selection - return all for random picking
      return recipes;

    default:
      return recipes;
  }
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
    let recipes = recipesResult.Items || [];

    if (recipes.length === 0) {
      return createResponse(200, {
        recommendations: [],
        message: 'No recipes found in database. Please add some recipes first.',
      });
    }

    const normalizedMoods = selectedMoods.map(m => m.toLowerCase());
    const primaryMood = normalizedMoods[0];

    // Apply mood-based filtering
    let filteredRecipes = recipes;

    // For multiple moods, apply AND logic (must match all)
    for (const mood of normalizedMoods) {
      filteredRecipes = filterByMood(filteredRecipes, inventory, mood);
    }

    // If no matches after filtering, return message
    if (filteredRecipes.length === 0) {
      return createResponse(200, {
        recommendations: [],
        message: `No drinks found matching your criteria: ${selectedMoods.join(', ')}. Try different moods or update your inventory.`,
        selectedMoods: normalizedMoods,
      });
    }

    // Calculate match scores
    const scoredRecipes = filteredRecipes.map(recipe => {
      const matchData = calculateMatchScore(recipe, inventory);
      return {
        ...recipe,
        matchScore: matchData.score,
        missingIngredients: matchData.missingIngredients,
        availableIngredients: matchData.availableIngredients,
        matchPercentage: matchData.matchPercentage,
        canMake: matchData.canMake,
      };
    });

    // Special handling for "lazy" mode - return ALL options organized by type
    if (primaryMood === 'lazy') {
      // Filter to only drinks we can make
      const makeableRecipes = scoredRecipes.filter(r => r.canMake);

      // Organize by subcategory
      const whiskeys = makeableRecipes.filter(r =>
        r.category === 'whiskey' || r.name.toLowerCase().includes('whiskey')
      ).sort((a, b) => b.matchScore - a.matchScore);

      const redWines = makeableRecipes.filter(r =>
        (r.category === 'wine' || r.name.toLowerCase().includes('wine')) &&
        (r.subcategory === 'red' || r.name.toLowerCase().includes('red'))
      ).sort((a, b) => b.matchScore - a.matchScore);

      const whiteWines = makeableRecipes.filter(r =>
        (r.category === 'wine' || r.name.toLowerCase().includes('wine')) &&
        (r.subcategory === 'white' || r.name.toLowerCase().includes('white'))
      ).sort((a, b) => b.matchScore - a.matchScore);

      return createResponse(200, {
        recommendations: makeableRecipes,
        organizedByType: {
          whiskeys,
          redWines,
          whiteWines,
        },
        totalRecipes: recipes.length,
        matchedRecipes: makeableRecipes.length,
        selectedMoods: normalizedMoods,
        isLazyMode: true,
      });
    }

    // Special handling for "surprise me" - return ONE random option
    if (primaryMood === 'surprise-me') {
      // Filter to only drinks we can make
      const makeable = scoredRecipes.filter(r => r.canMake);

      if (makeable.length === 0) {
        // If can't make any, just pick random from all
        const randomIndex = Math.floor(Math.random() * scoredRecipes.length);
        return createResponse(200, {
          recommendations: [scoredRecipes[randomIndex]],
          totalRecipes: recipes.length,
          selectedMoods: normalizedMoods,
          isSurpriseMode: true,
        });
      }

      const randomIndex = Math.floor(Math.random() * makeable.length);
      return createResponse(200, {
        recommendations: [makeable[randomIndex]],
        totalRecipes: recipes.length,
        selectedMoods: normalizedMoods,
        isSurpriseMode: true,
      });
    }

    // For all other moods - return top 3 drinks we can make
    const makeableRecipes = scoredRecipes.filter(r => r.canMake);

    if (makeableRecipes.length === 0) {
      return createResponse(200, {
        recommendations: [],
        message: `No drinks found that you can make with your current inventory for: ${selectedMoods.join(', ')}. Try different moods or update your inventory.`,
        totalRecipes: recipes.length,
        selectedMoods: normalizedMoods,
      });
    }

    makeableRecipes.sort((a, b) => b.matchScore - a.matchScore);
    const top3 = makeableRecipes.slice(0, 3);

    return createResponse(200, {
      recommendations: top3,
      totalRecipes: recipes.length,
      matchedRecipes: makeableRecipes.length,
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
