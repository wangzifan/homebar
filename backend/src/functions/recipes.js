const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const RECIPES_TABLE = process.env.RECIPES_TABLE || 'MyHomeBar-Recipes';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

const createResponse = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

// GET /recipes - List all recipes
const listRecipes = async () => {
  try {
    const command = new ScanCommand({
      TableName: RECIPES_TABLE,
    });

    const result = await docClient.send(command);
    return createResponse(200, {
      recipes: result.Items || [],
      count: result.Count,
    });
  } catch (error) {
    console.error('Error listing recipes:', error);
    return createResponse(500, { error: 'Failed to list recipes' });
  }
};

// GET /recipes/:id - Get specific recipe
const getRecipe = async (recipeId) => {
  try {
    const command = new GetCommand({
      TableName: RECIPES_TABLE,
      Key: { recipeId },
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return createResponse(404, { error: 'Recipe not found' });
    }

    return createResponse(200, result.Item);
  } catch (error) {
    console.error('Error getting recipe:', error);
    return createResponse(500, { error: 'Failed to get recipe' });
  }
};

// POST /recipes - Create new recipe
const createRecipe = async (data) => {
  try {
    const now = new Date().toISOString();
    const recipe = {
      recipeId: uuidv4(),
      name: data.name,
      description: data.description || '',
      category: data.category || 'cocktail',
      glassType: data.glassType || '',
      difficulty: data.difficulty || 'medium',
      preparationTime: data.preparationTime || 5,
      ingredients: data.ingredients || [],
      instructions: data.instructions || [],
      garnish: data.garnish || '',
      moods: data.moods || [],
      tags: data.tags || [],
      imageUrl: data.imageUrl || null,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: RECIPES_TABLE,
      Item: recipe,
    });

    await docClient.send(command);
    return createResponse(201, recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return createResponse(500, { error: 'Failed to create recipe' });
  }
};

// PUT /recipes/:id - Update recipe
const updateRecipe = async (recipeId, data) => {
  try {
    const now = new Date().toISOString();

    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    const updateableFields = [
      'name', 'description', 'category', 'glassType', 'difficulty',
      'preparationTime', 'ingredients', 'instructions', 'garnish',
      'moods', 'tags', 'imageUrl'
    ];

    updateableFields.forEach(field => {
      if (data[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = data[field];
      }
    });

    if (updateExpressions.length === 0) {
      return createResponse(400, { error: 'No valid fields to update' });
    }

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    const command = new UpdateCommand({
      TableName: RECIPES_TABLE,
      Key: { recipeId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    return createResponse(200, result.Attributes);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return createResponse(500, { error: 'Failed to update recipe' });
  }
};

// DELETE /recipes/:id - Delete recipe
const deleteRecipe = async (recipeId) => {
  try {
    const command = new DeleteCommand({
      TableName: RECIPES_TABLE,
      Key: { recipeId },
    });

    await docClient.send(command);
    return createResponse(200, { message: 'Recipe deleted successfully', recipeId });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return createResponse(500, { error: 'Failed to delete recipe' });
  }
};

// Main Lambda handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  const { httpMethod, pathParameters, body } = event;
  const recipeId = pathParameters?.id;

  try {
    switch (httpMethod) {
      case 'GET':
        if (recipeId) {
          return await getRecipe(recipeId);
        } else {
          return await listRecipes();
        }

      case 'POST':
        const createData = JSON.parse(body);
        return await createRecipe(createData);

      case 'PUT':
        if (!recipeId) {
          return createResponse(400, { error: 'Recipe ID is required' });
        }
        const updateData = JSON.parse(body);
        return await updateRecipe(recipeId, updateData);

      case 'DELETE':
        if (!recipeId) {
          return createResponse(400, { error: 'Recipe ID is required' });
        }
        return await deleteRecipe(recipeId);

      default:
        return createResponse(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};
