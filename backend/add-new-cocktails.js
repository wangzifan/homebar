const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-west-2' });
const docClient = DynamoDBDocumentClient.from(client);

const RECIPES_TABLE = 'MyHomeBar-Recipes';

const newRecipes = [
  {
    recipeId: 'lemon-drop',
    name: 'Lemon Drop',
    category: 'vodka',
    description: 'A tart and sweet vodka cocktail with a sugared rim',
    ingredients: [
      { name: 'Vodka', quantity: '2', unit: 'oz' },
      { name: 'Fresh Lemon Juice', quantity: '1', unit: 'oz' },
      { name: 'Simple Syrup', quantity: '0.5', unit: 'oz' },
      { name: 'Triple Sec', quantity: '0.5', unit: 'oz' },
      { name: 'Sugar', quantity: '1', unit: 'tsp', optional: true }
    ],
    instructions: [
      'Rim a chilled martini glass with sugar',
      'Add all ingredients to a shaker with ice',
      'Shake vigorously for 15 seconds',
      'Strain into the prepared glass',
      'Garnish with a lemon twist'
    ],
    glassType: 'Martini Glass',
    garnish: 'Lemon twist',
    abv: 22,
    difficulty: 'Easy',
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/lemon-drop.jpg'
  },
  {
    recipeId: 'cosmopolitan',
    name: 'Cosmopolitan',
    category: 'vodka',
    description: 'A sophisticated cocktail made famous by Sex and the City',
    ingredients: [
      { name: 'Vodka', quantity: '1.5', unit: 'oz' },
      { name: 'Cointreau', quantity: '1', unit: 'oz' },
      { name: 'Fresh Lime Juice', quantity: '0.5', unit: 'oz' },
      { name: 'Cranberry Juice', quantity: '0.5', unit: 'oz' }
    ],
    instructions: [
      'Add all ingredients to a shaker with ice',
      'Shake well until chilled',
      'Strain into a chilled martini glass',
      'Garnish with a lime wheel or orange twist'
    ],
    glassType: 'Martini Glass',
    garnish: 'Lime wheel or orange twist',
    abv: 20,
    difficulty: 'Easy',
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/cosmopolitan.jpg'
  },
  {
    recipeId: 'spicy-margarita',
    name: 'Spicy Margarita',
    category: 'tequila',
    description: 'A fiery twist on the classic margarita with jalapeño',
    ingredients: [
      { name: 'Tequila', quantity: '2', unit: 'oz' },
      { name: 'Fresh Lime Juice', quantity: '1', unit: 'oz' },
      { name: 'Agave Syrup', quantity: '0.75', unit: 'oz' },
      { name: 'Jalapeño Slices', quantity: '3', unit: 'slices' },
      { name: 'Salt', quantity: '1', unit: 'pinch', optional: true }
    ],
    instructions: [
      'Muddle jalapeño slices in a shaker',
      'Add tequila, lime juice, and agave syrup',
      'Fill with ice and shake vigorously',
      'Strain into a salt-rimmed rocks glass over fresh ice',
      'Garnish with a jalapeño slice'
    ],
    glassType: 'Rocks Glass',
    garnish: 'Jalapeño slice',
    abv: 18,
    difficulty: 'Easy',
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/spicy-margarita.jpg'
  },
  {
    recipeId: 'tequila-sunrise',
    name: 'Tequila Sunrise',
    category: 'tequila',
    description: 'A beautiful layered cocktail that resembles a sunrise',
    ingredients: [
      { name: 'Tequila', quantity: '2', unit: 'oz' },
      { name: 'Orange Juice', quantity: '4', unit: 'oz' },
      { name: 'Grenadine', quantity: '0.5', unit: 'oz' }
    ],
    instructions: [
      'Fill a highball glass with ice',
      'Pour tequila and orange juice, stir gently',
      'Slowly pour grenadine down the side of the glass',
      'Let it settle to create the sunrise effect',
      'Garnish with an orange slice and cherry'
    ],
    glassType: 'Highball Glass',
    garnish: 'Orange slice and cherry',
    abv: 10,
    difficulty: 'Easy',
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/tequila-sunrise.jpg'
  },
  {
    recipeId: 'lillet-tonic',
    name: 'Lillet Tonic',
    category: 'wine',
    description: 'A refreshing aperitif with Lillet Blanc and tonic water',
    ingredients: [
      { name: 'Lillet Blanc', quantity: '2', unit: 'oz' },
      { name: 'Tonic Water', quantity: '4', unit: 'oz' }
    ],
    instructions: [
      'Fill a wine glass with ice',
      'Pour Lillet Blanc over ice',
      'Top with tonic water',
      'Stir gently',
      'Garnish with a cucumber slice and mint'
    ],
    glassType: 'Wine Glass',
    garnish: 'Cucumber slice and mint',
    abv: 8,
    difficulty: 'Easy',
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/lillet-tonic.jpg'
  },
  {
    recipeId: 'french-75',
    name: 'French 75',
    category: 'gin',
    description: 'An elegant champagne cocktail with gin and lemon',
    ingredients: [
      { name: 'Gin', quantity: '1', unit: 'oz' },
      { name: 'Fresh Lemon Juice', quantity: '0.5', unit: 'oz' },
      { name: 'Simple Syrup', quantity: '0.5', unit: 'oz' },
      { name: 'Champagne', quantity: '3', unit: 'oz' }
    ],
    instructions: [
      'Add gin, lemon juice, and simple syrup to a shaker with ice',
      'Shake well and strain into a champagne flute',
      'Top with champagne',
      'Garnish with a lemon twist'
    ],
    glassType: 'Champagne Flute',
    garnish: 'Lemon twist',
    abv: 15,
    difficulty: 'Easy',
    moods: ['sparkling'],
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/french-75.jpg'
  },
  {
    recipeId: 'espresso-martini',
    name: 'Espresso Martini',
    category: 'vodka',
    description: 'A rich coffee cocktail perfect for after dinner',
    ingredients: [
      { name: 'Vodka', quantity: '2', unit: 'oz' },
      { name: 'Coffee Liqueur', quantity: '1', unit: 'oz' },
      { name: 'Fresh Espresso', quantity: '1', unit: 'oz' },
      { name: 'Simple Syrup', quantity: '0.5', unit: 'oz' }
    ],
    instructions: [
      'Add all ingredients to a shaker with ice',
      'Shake vigorously for 15 seconds',
      'Strain into a chilled martini glass',
      'Garnish with 3 coffee beans'
    ],
    glassType: 'Martini Glass',
    garnish: '3 coffee beans',
    abv: 18,
    difficulty: 'Medium',
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/espresso-martini.jpg'
  },
  {
    recipeId: 'paloma',
    name: 'Paloma',
    category: 'tequila',
    description: 'Mexico\'s most popular tequila cocktail with grapefruit',
    ingredients: [
      { name: 'Tequila', quantity: '2', unit: 'oz' },
      { name: 'Fresh Lime Juice', quantity: '0.5', unit: 'oz' },
      { name: 'Grapefruit Soda', quantity: '4', unit: 'oz' },
      { name: 'Salt', quantity: '1', unit: 'pinch', optional: true }
    ],
    instructions: [
      'Rim a highball glass with salt',
      'Fill with ice',
      'Add tequila and lime juice',
      'Top with grapefruit soda',
      'Stir gently and garnish with a grapefruit wedge'
    ],
    glassType: 'Highball Glass',
    garnish: 'Grapefruit wedge',
    abv: 12,
    difficulty: 'Easy',
    moods: ['sparkling'],
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/paloma.jpg'
  },
  {
    recipeId: 'midori-sour',
    name: 'Midori Sour',
    category: 'liqueur',
    description: 'A sweet and sour melon liqueur cocktail',
    ingredients: [
      { name: 'Midori Melon Liqueur', quantity: '2', unit: 'oz' },
      { name: 'Fresh Lemon Juice', quantity: '1', unit: 'oz' },
      { name: 'Simple Syrup', quantity: '0.5', unit: 'oz' }
    ],
    instructions: [
      'Add all ingredients to a shaker with ice',
      'Shake well',
      'Strain into a rocks glass over fresh ice',
      'Garnish with a cherry and orange slice'
    ],
    glassType: 'Rocks Glass',
    garnish: 'Cherry and orange slice',
    abv: 14,
    difficulty: 'Easy',
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/midori-sour.jpg'
  },
  {
    recipeId: 'mimosa',
    name: 'Mimosa',
    category: 'wine',
    description: 'The classic brunch cocktail with champagne and orange juice',
    ingredients: [
      { name: 'Champagne', quantity: '3', unit: 'oz' },
      { name: 'Fresh Orange Juice', quantity: '3', unit: 'oz' }
    ],
    instructions: [
      'Pour chilled champagne into a champagne flute',
      'Top with fresh orange juice',
      'Stir gently',
      'Garnish with an orange slice'
    ],
    glassType: 'Champagne Flute',
    garnish: 'Orange slice',
    abv: 7,
    difficulty: 'Easy',
    moods: ['sparkling'],
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/mimosa.jpg'
  },
  {
    recipeId: 'pineapple-campari',
    name: 'Pineapple Campari',
    category: 'liqueur',
    description: 'A tropical twist on a bitter Italian classic',
    ingredients: [
      { name: 'Campari', quantity: '1.5', unit: 'oz' },
      { name: 'Pineapple Juice', quantity: '3', unit: 'oz' },
      { name: 'Fresh Lime Juice', quantity: '0.5', unit: 'oz' },
      { name: 'Club Soda', quantity: '2', unit: 'oz' }
    ],
    instructions: [
      'Fill a highball glass with ice',
      'Add Campari, pineapple juice, and lime juice',
      'Stir well',
      'Top with club soda',
      'Garnish with a pineapple wedge'
    ],
    glassType: 'Highball Glass',
    garnish: 'Pineapple wedge',
    abv: 8,
    difficulty: 'Easy',
    moods: ['sparkling'],
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/pineapple-campari.jpg'
  },
  {
    recipeId: 'aperol-sour',
    name: 'Aperol Sour',
    category: 'liqueur',
    description: 'A bittersweet sour cocktail with Italian aperitif',
    ingredients: [
      { name: 'Aperol', quantity: '2', unit: 'oz' },
      { name: 'Fresh Lemon Juice', quantity: '1', unit: 'oz' },
      { name: 'Simple Syrup', quantity: '0.5', unit: 'oz' },
      { name: 'Egg White', quantity: '1', unit: 'oz', optional: true }
    ],
    instructions: [
      'Add all ingredients to a shaker without ice (dry shake)',
      'Shake vigorously for 10 seconds',
      'Add ice and shake again',
      'Strain into a coupe glass',
      'Garnish with an orange twist'
    ],
    glassType: 'Coupe Glass',
    garnish: 'Orange twist',
    abv: 12,
    difficulty: 'Medium',
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/aperol-sour.jpg'
  },
  {
    recipeId: 'blackberry-whiskey-sour',
    name: 'Blackberry Whiskey Sour',
    category: 'whiskey',
    description: 'A fruity twist on the classic whiskey sour',
    ingredients: [
      { name: 'Whiskey', quantity: '2', unit: 'oz' },
      { name: 'Fresh Lemon Juice', quantity: '0.75', unit: 'oz' },
      { name: 'Simple Syrup', quantity: '0.5', unit: 'oz' },
      { name: 'Fresh Blackberries', quantity: '4', unit: 'berries' },
      { name: 'Egg White', quantity: '1', unit: 'oz', optional: true }
    ],
    instructions: [
      'Muddle blackberries in a shaker',
      'Add whiskey, lemon juice, simple syrup, and egg white',
      'Dry shake (without ice) for 10 seconds',
      'Add ice and shake vigorously',
      'Double strain into a rocks glass over fresh ice',
      'Garnish with blackberries and a lemon wheel'
    ],
    glassType: 'Rocks Glass',
    garnish: 'Blackberries and lemon wheel',
    abv: 16,
    difficulty: 'Medium',
    imageUrl: 'https://myhomebar-images-436173857018.s3.us-west-2.amazonaws.com/blackberry-whiskey-sour.jpg'
  }
];

async function addRecipes() {
  console.log(`Adding ${newRecipes.length} new cocktail recipes...`);

  for (const recipe of newRecipes) {
    try {
      await docClient.send(new PutCommand({
        TableName: RECIPES_TABLE,
        Item: recipe
      }));
      console.log(`✓ Added: ${recipe.name}`);
    } catch (error) {
      console.error(`✗ Failed to add ${recipe.name}:`, error.message);
    }
  }

  console.log('\nDone!');
}

addRecipes();
