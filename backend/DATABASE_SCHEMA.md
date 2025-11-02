# DynamoDB Schema Design

## Table 1: Inventory

**Table Name**: `MyHomeBar-Inventory`

### Primary Key
- **PK**: `itemId` (String) - UUID for each inventory item
- **SK**: N/A (Single-table design)

### Attributes
```json
{
  "itemId": "uuid-string",
  "name": "string",
  "category": "string",  // spirits, liqueurs, mixers, fruits, herbs, wine, whiskey
  "quantity": "number",
  "unit": "string",  // ml, oz, count, bunch
  "expirationDate": "string",  // ISO 8601 date (optional, mainly for fruits/mixers)
  "purchaseDate": "string",  // ISO 8601 date
  "brand": "string",  // optional
  "notes": "string",  // optional
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Global Secondary Index (GSI)
- **GSI-1**: `category-expirationDate-index`
  - PK: `category`
  - SK: `expirationDate`
  - Purpose: Query items by category and find expiring items

### Example Items
```json
{
  "itemId": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Tanqueray Gin",
  "category": "spirits",
  "quantity": 750,
  "unit": "ml",
  "brand": "Tanqueray",
  "purchaseDate": "2024-10-15",
  "createdAt": "2024-10-15T10:30:00Z",
  "updatedAt": "2024-10-15T10:30:00Z"
}

{
  "itemId": "550e8400-e29b-41d4-a716-446655440002",
  "name": "Fresh Lemon",
  "category": "fruits",
  "quantity": 3,
  "unit": "count",
  "expirationDate": "2024-11-05",
  "purchaseDate": "2024-10-28",
  "createdAt": "2024-10-28T09:00:00Z",
  "updatedAt": "2024-10-28T09:00:00Z"
}
```

---

## Table 2: Recipes

**Table Name**: `MyHomeBar-Recipes`

### Primary Key
- **PK**: `recipeId` (String) - UUID for each recipe
- **SK**: N/A

### Attributes
```json
{
  "recipeId": "uuid-string",
  "name": "string",
  "description": "string",
  "category": "string",  // cocktail, wine, whiskey-neat, etc.
  "glassType": "string",
  "difficulty": "string",  // easy, medium, hard
  "preparationTime": "number",  // minutes
  "ingredients": [
    {
      "name": "string",
      "quantity": "number",
      "unit": "string",
      "optional": "boolean"
    }
  ],
  "instructions": ["string"],
  "garnish": "string",
  "moods": ["string"],  // lazy, sparkling, warm, light, strong, sweet, sour, refreshing
  "tags": ["string"],  // additional tags: classic, tiki, modern, etc.
  "imageUrl": "string",  // optional
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Global Secondary Indexes
- **GSI-1**: `category-index`
  - PK: `category`
  - Purpose: Query recipes by category

### Example Recipe
```json
{
  "recipeId": "recipe-001",
  "name": "Classic Martini",
  "description": "A timeless gin-based cocktail",
  "category": "cocktail",
  "glassType": "martini",
  "difficulty": "easy",
  "preparationTime": 3,
  "ingredients": [
    {
      "name": "Gin",
      "quantity": 60,
      "unit": "ml",
      "optional": false
    },
    {
      "name": "Dry Vermouth",
      "quantity": 10,
      "unit": "ml",
      "optional": false
    }
  ],
  "instructions": [
    "Chill martini glass",
    "Add gin and vermouth to mixing glass with ice",
    "Stir for 30 seconds",
    "Strain into chilled glass"
  ],
  "garnish": "Olive or lemon twist",
  "moods": ["lazy", "strong", "classic"],
  "tags": ["classic", "stirred", "spirit-forward"],
  "createdAt": "2024-10-15T10:30:00Z",
  "updatedAt": "2024-10-15T10:30:00Z"
}
```

---

## Mood/Preference Mapping

| Mood | Characteristics | Example Drinks |
|------|----------------|----------------|
| lazy | No mixing, minimal prep | Neat whiskey, wine, beer |
| sparkling | Effervescent, bubbly | Champagne, Aperol Spritz, Gin Fizz |
| warm | Hot or warm drinks | Hot Toddy, Irish Coffee, Mulled Wine |
| light | Low-ABV, refreshing | Aperol Spritz, Mimosa, Light Beer |
| strong | Spirit-forward, high-ABV | Martini, Manhattan, Old Fashioned |
| sweet | Fruity, dessert-like | Piña Colada, Mudslide, Sweet wine |
| sour | Citrus-forward, tart | Margarita, Whiskey Sour, Daiquiri |
| refreshing | Crisp, cooling | Mojito, Gin & Tonic, Moscow Mule |

## API Operations

### Inventory Endpoints
- `GET /inventory` - List all inventory items
- `GET /inventory/:id` - Get specific item
- `POST /inventory` - Add new item
- `PUT /inventory/:id` - Update item
- `DELETE /inventory/:id` - Delete item
- `GET /inventory/expiring` - Get items expiring soon

### Recipe Endpoints
- `GET /recipes` - List all recipes
- `GET /recipes/:id` - Get specific recipe
- `POST /recipes` - Add new recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe

### Recommendation Endpoint
- `POST /recommendations` - Get top 3 drink recommendations
  - Request body: `{ "mood": "string", "preferences": ["array"] }`
  - Response: Array of 3 matched recipes with availability status
