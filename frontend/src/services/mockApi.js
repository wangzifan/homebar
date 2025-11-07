// Mock API for local development without backend
// Use this by importing from './mockApi' instead of './api'

import sampleRecipes from '../../../backend/src/data/sample-recipes.json';
import sampleInventory from '../../../backend/src/data/sample-inventory.json';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage
let inventory = [...sampleInventory];
let recipes = [...sampleRecipes];

// Helper function to normalize ingredient names for matching
const normalizeIngredientName = (name) => {
  return name.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b(gin|vodka|rum|tequila|whiskey|bourbon|scotch|brandy|cognac)\b.*/, '$1')
    .replace(/fresh\s+/, '')
    .replace(/\bjuice\b/, '')
    .replace(/\bsyrup\b/, '');
};

// Check if inventory has ingredient
const hasIngredient = (requiredIngredient) => {
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

// Calculate match score
const calculateMatchScore = (recipe, selectedMoods) => {
  let score = 0;
  let missingIngredients = [];
  let availableIngredients = [];

  recipe.ingredients.forEach(ingredient => {
    if (hasIngredient(ingredient.name)) {
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

  if (recipe.moods && Array.isArray(recipe.moods)) {
    const moodMatches = recipe.moods.filter(mood =>
      selectedMoods.includes(mood.toLowerCase())
    ).length;
    score += moodMatches * 15;
  }

  if (recipe.difficulty === 'easy') score += 8;
  if (recipe.difficulty === 'medium') score += 5;
  if (recipe.preparationTime <= 3) score += 10;
  else if (recipe.preparationTime <= 5) score += 5;

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
  // Only match recipes that explicitly have these terms in the NAME
  const hotTerms = ['hot', 'warm', 'toddy', 'irish coffee', 'mulled'];
  const recipeName = recipe.name.toLowerCase();

  return hotTerms.some(term => recipeName.includes(term)) ||
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

  // Or has low ABV (less than 18%)
  const hasLowABV = recipe.abv && recipe.abv < 18;

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

// Filter recipes based on mood rules
const filterByMood = (recipes, mood) => {
  switch (mood) {
    case 'lazy':
      // This case is handled separately in recommendationsApi
      return recipes;

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

    case 'sour':
      // Citrus-forward cocktails
      const sourTerms = ['lemon', 'lime', 'grapefruit', 'citrus'];
      return recipes.filter(recipe =>
        recipe.ingredients.some(ing => {
          const name = ing.name.toLowerCase();
          return sourTerms.some(term => name.includes(term));
        })
      );

    case 'surprise-me':
      // Random selection - return all for random picking
      return recipes;

    default:
      return recipes;
  }
};

// Mock API implementation
export const inventoryApi = {
  getAll: async () => {
    await delay(300);
    return { data: { items: inventory, count: inventory.length } };
  },

  getById: async (id) => {
    await delay(200);
    const item = inventory.find(i => i.itemId === id);
    if (!item) throw new Error('Item not found');
    return { data: item };
  },

  create: async (data) => {
    await delay(300);
    const now = new Date().toISOString();
    const newItem = {
      itemId: `inv-${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    inventory.push(newItem);
    return { data: newItem };
  },

  update: async (id, data) => {
    await delay(300);
    const index = inventory.findIndex(i => i.itemId === id);
    if (index === -1) throw new Error('Item not found');

    const now = new Date().toISOString();
    inventory[index] = {
      ...inventory[index],
      ...data,
      updatedAt: now,
    };
    return { data: inventory[index] };
  },

  delete: async (id) => {
    await delay(300);
    const index = inventory.findIndex(i => i.itemId === id);
    if (index === -1) throw new Error('Item not found');

    inventory.splice(index, 1);
    return { data: { message: 'Item deleted successfully', itemId: id } };
  },

  getExpiring: async (days = 7) => {
    await delay(300);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const expiring = inventory.filter(item => {
      if (!item.expirationDate) return false;
      const expDate = new Date(item.expirationDate);
      return expDate <= futureDate && expDate >= new Date();
    });

    return { data: { items: expiring, count: expiring.length, daysAhead: days } };
  },
};

export const recipesApi = {
  getAll: async () => {
    await delay(300);
    return { data: { recipes, count: recipes.length } };
  },

  getById: async (id) => {
    await delay(200);
    const recipe = recipes.find(r => r.recipeId === id);
    if (!recipe) throw new Error('Recipe not found');
    return { data: recipe };
  },

  create: async (data) => {
    await delay(300);
    const now = new Date().toISOString();
    const newRecipe = {
      recipeId: `recipe-${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    recipes.push(newRecipe);
    return { data: newRecipe };
  },

  update: async (id, data) => {
    await delay(300);
    const index = recipes.findIndex(r => r.recipeId === id);
    if (index === -1) throw new Error('Recipe not found');

    const now = new Date().toISOString();
    recipes[index] = {
      ...recipes[index],
      ...data,
      updatedAt: now,
    };
    return { data: recipes[index] };
  },

  delete: async (id) => {
    await delay(300);
    const index = recipes.findIndex(r => r.recipeId === id);
    if (index === -1) throw new Error('Recipe not found');

    recipes.splice(index, 1);
    return { data: { message: 'Recipe deleted successfully', recipeId: id } };
  },
};

export const recommendationsApi = {
  get: async (moods, preferences = {}) => {
    await delay(500);

    const normalizedMoods = moods.map(m => m.toLowerCase());
    const primaryMood = normalizedMoods[0];

    // Special handling for "lazy" mode - return inventory items directly
    if (primaryMood === 'lazy') {
      const readyToDrink = inventory.filter(item => {
        // Filter to ready-to-drink categories with available quantity
        const isReadyToDrinkCategory =
          item.category === 'whiskey' ||
          item.category === 'wine' ||
          item.category === 'beer' ||
          item.category === 'sake';

        const hasQuantity = item.quantity && item.quantity > 0;

        // Check if not expired (for items with expiration dates)
        let notExpired = true;
        if (item.expirationDate) {
          const expDate = new Date(item.expirationDate);
          const now = new Date();
          notExpired = expDate >= now;
        }

        return isReadyToDrinkCategory && hasQuantity && notExpired;
      });

      // Organize by category
      const whiskeys = readyToDrink.filter(item => item.category === 'whiskey');
      const sake = readyToDrink.filter(item => item.category === 'sake');
      const wines = readyToDrink.filter(item => item.category === 'wine');
      const beers = readyToDrink.filter(item => item.category === 'beer');

      return {
        data: {
          recommendations: readyToDrink,
          organizedByType: {
            whiskeys,
            sake,
            wines,
            beers,
          },
          totalItems: readyToDrink.length,
          selectedMoods: normalizedMoods,
          isLazyMode: true,
          isInventoryMode: true,
        },
      };
    }

    // Apply mood-based filtering
    let filteredRecipes = recipes;

    // For multiple moods, apply AND logic (must match all)
    for (const mood of normalizedMoods) {
      filteredRecipes = filterByMood(filteredRecipes, mood);
    }

    // If no matches after filtering, return message
    if (filteredRecipes.length === 0) {
      return {
        data: {
          recommendations: [],
          message: `No drinks found matching your criteria: ${normalizedMoods.join(', ')}. Try different moods or update your inventory.`,
          selectedMoods: normalizedMoods,
        },
      };
    }

    // Calculate match scores for filtered recipes
    const scoredRecipes = filteredRecipes.map(recipe => {
      const matchData = calculateMatchScore(recipe, normalizedMoods);
      return {
        ...recipe,
        matchScore: matchData.score,
        missingIngredients: matchData.missingIngredients,
        availableIngredients: matchData.availableIngredients,
        matchPercentage: matchData.matchPercentage,
        canMake: matchData.canMake,
      };
    });

    // For surprise-me mode - return one random drink
    if (primaryMood === 'surprise-me') {
      const makeable = scoredRecipes.filter(r => r.canMake);

      if (makeable.length === 0) {
        // If can't make any, just pick random from all
        const randomIndex = Math.floor(Math.random() * scoredRecipes.length);
        return {
          data: {
            recommendations: [scoredRecipes[randomIndex]],
            totalRecipes: recipes.length,
            selectedMoods: normalizedMoods,
            isSurpriseMode: true,
          },
        };
      }

      const randomIndex = Math.floor(Math.random() * makeable.length);
      return {
        data: {
          recommendations: [makeable[randomIndex]],
          totalRecipes: recipes.length,
          selectedMoods: normalizedMoods,
          isSurpriseMode: true,
        },
      };
    }

    // Normal mode - return up to 3 random drinks we can make
    const makeableRecipes = scoredRecipes.filter(r => r.canMake);

    if (makeableRecipes.length === 0) {
      return {
        data: {
          recommendations: [],
          message: `No drinks found that you can make with your current inventory for: ${normalizedMoods.join(', ')}. Try different moods or update your inventory.`,
          totalRecipes: recipes.length,
          selectedMoods: normalizedMoods,
        },
      };
    }

    // Randomly select up to 3 recipes (instead of always showing the same top-scoring ones)
    const shuffled = makeableRecipes.sort(() => Math.random() - 0.5);
    const randomSelection = shuffled.slice(0, Math.min(3, makeableRecipes.length));

    return {
      data: {
        recommendations: randomSelection,
        totalRecipes: recipes.length,
        matchedRecipes: makeableRecipes.length,
        inventoryItemsCount: inventory.length,
        selectedMoods: normalizedMoods,
      },
    };
  },
};

export const imageApi = {
  uploadImage: async (file) => {
    // In mock mode, just return base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ data: { url: reader.result } });
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  },
};

export default {
  inventoryApi,
  recipesApi,
  recommendationsApi,
  imageApi,
};
