const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const INVENTORY_TABLE = process.env.INVENTORY_TABLE || 'MyHomeBar-Inventory';

// CORS headers for all responses
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

// Helper function to create response
const createResponse = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

// GET /inventory - List all inventory items
const listInventory = async () => {
  try {
    const command = new ScanCommand({
      TableName: INVENTORY_TABLE,
    });

    const result = await docClient.send(command);
    return createResponse(200, {
      items: result.Items || [],
      count: result.Count,
    });
  } catch (error) {
    console.error('Error listing inventory:', error);
    return createResponse(500, { error: 'Failed to list inventory items' });
  }
};

// GET /inventory/:id - Get specific inventory item
const getInventoryItem = async (itemId) => {
  try {
    const command = new GetCommand({
      TableName: INVENTORY_TABLE,
      Key: { itemId },
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return createResponse(404, { error: 'Item not found' });
    }

    return createResponse(200, result.Item);
  } catch (error) {
    console.error('Error getting inventory item:', error);
    return createResponse(500, { error: 'Failed to get inventory item' });
  }
};

// POST /inventory - Create new inventory item
const createInventoryItem = async (data) => {
  try {
    const now = new Date().toISOString();
    const item = {
      itemId: uuidv4(),
      name: data.name,
      category: data.category,
      quantity: data.quantity || 0,
      unit: data.unit || 'ml',
      purchaseDate: data.purchaseDate || now.split('T')[0],
      createdAt: now,
      updatedAt: now,
    };

    // Only include optional fields if they have values (to avoid GSI issues with null)
    if (data.expirationDate) {
      item.expirationDate = data.expirationDate;
    }
    if (data.brand) {
      item.brand = data.brand;
    }
    if (data.notes) {
      item.notes = data.notes;
    }

    const command = new PutCommand({
      TableName: INVENTORY_TABLE,
      Item: item,
    });

    await docClient.send(command);
    return createResponse(201, item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return createResponse(500, { error: 'Failed to create inventory item' });
  }
};

// PUT /inventory/:id - Update inventory item
const updateInventoryItem = async (itemId, data) => {
  try {
    const now = new Date().toISOString();

    // Build update expression dynamically
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    const updateableFields = ['name', 'category', 'quantity', 'unit', 'expirationDate', 'brand', 'notes'];

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
      TableName: INVENTORY_TABLE,
      Key: { itemId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    return createResponse(200, result.Attributes);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return createResponse(500, { error: 'Failed to update inventory item' });
  }
};

// DELETE /inventory/:id - Delete inventory item
const deleteInventoryItem = async (itemId) => {
  try {
    const command = new DeleteCommand({
      TableName: INVENTORY_TABLE,
      Key: { itemId },
    });

    await docClient.send(command);
    return createResponse(200, { message: 'Item deleted successfully', itemId });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return createResponse(500, { error: 'Failed to delete inventory item' });
  }
};

// GET /inventory/expiring - Get items expiring soon
const getExpiringItems = async (daysAhead = 7) => {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const command = new ScanCommand({
      TableName: INVENTORY_TABLE,
      FilterExpression: 'expirationDate <= :futureDate AND expirationDate <> :null',
      ExpressionAttributeValues: {
        ':futureDate': futureDateString,
        ':null': null,
      },
    });

    const result = await docClient.send(command);
    return createResponse(200, {
      items: result.Items || [],
      count: result.Count,
      daysAhead,
    });
  } catch (error) {
    console.error('Error getting expiring items:', error);
    return createResponse(500, { error: 'Failed to get expiring items' });
  }
};

// Main Lambda handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  const { httpMethod, pathParameters, body, queryStringParameters } = event;
  const itemId = pathParameters?.id;

  try {
    switch (httpMethod) {
      case 'GET':
        if (event.path.includes('/expiring')) {
          const daysAhead = queryStringParameters?.days ? parseInt(queryStringParameters.days) : 7;
          return await getExpiringItems(daysAhead);
        } else if (itemId) {
          return await getInventoryItem(itemId);
        } else {
          return await listInventory();
        }

      case 'POST':
        const createData = JSON.parse(body);
        return await createInventoryItem(createData);

      case 'PUT':
        if (!itemId) {
          return createResponse(400, { error: 'Item ID is required' });
        }
        const updateData = JSON.parse(body);
        return await updateInventoryItem(itemId, updateData);

      case 'DELETE':
        if (!itemId) {
          return createResponse(400, { error: 'Item ID is required' });
        }
        return await deleteInventoryItem(itemId);

      default:
        return createResponse(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};
