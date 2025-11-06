# Updating MyHomeBar with New Recommendation Rules

I've updated the app with your custom rules! Here's what changed and how to deploy.

## 🎯 What's New

### Updated Recommendation Rules

1. **Lazy Night** - Shows ALL whiskey and wine options, organized by type (whiskeys, red wines, white wines)
2. **Sparkling** - Must contain tonic water, club soda, or sparkling wine
3. **Warm & Cozy** - Hot drinks only (Irish coffee, hot toddy, mulled wine)
4. **Light & Easy** - Low calorie with light tonic, club soda, or beer (excludes Old Fashioned/Negroni)
5. **Strong & Bold** - ABV > 20% only
6. **Sweet Tooth** - Must include juice or sweet liqueurs (syrup, flavored liqueurs)
7. **Surprise Me!** (was "Refreshing") - Returns ONE random drink

### Updated Files

**Backend:**
- `backend/src/functions/recommendations.js` - New matching logic with strict rules

**Frontend:**
- `frontend/src/pages/Welcome.jsx` - Updated mood options (Refreshing → Surprise Me!)
- `frontend/src/pages/Recommendations.jsx` - Handle lazy mode (show all) and surprise mode (one random)
- `frontend/src/pages/Recommendations.css` - Styles for lazy mode category sections
- `frontend/src/services/mockApi.js` - Updated for local testing

## 🚀 How to Deploy

### Step 1: Deploy Updated Backend

```bash
# Navigate to infrastructure directory
cd infrastructure

# Build the updated Lambda functions
sam build

# Deploy to AWS (no --guided needed, uses existing config)
sam deploy --region us-west-2

# Wait for deployment (about 1-2 minutes)
```

### Step 2: Update Frontend

If using **Amplify** (automatic):
```bash
# Just commit and push - Amplify will rebuild automatically
git add .
git commit -m "Update recommendation rules and UI"
git push origin main

# Wait for Amplify to build (2-3 minutes)
# Watch at: https://console.aws.amazon.com/amplify/
```

If using **S3** (manual):
```bash
# Build frontend
cd frontend
npm run build

# Get bucket name
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name homebar \
  --region us-west-2 \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

# Deploy to S3
aws s3 sync dist/ s3://$BUCKET/ --delete --region us-west-2
```

### Step 3: Test the New Rules

Visit your app and test each mood:

1. **Lazy Night** - Should show all whiskeys and wines organized by type
2. **Sparkling** - Should only show drinks with tonic/soda/sparkling wine
3. **Warm** - Should only show hot drinks
4. **Light** - Should show low-cal options (no Old Fashioned/Negroni)
5. **Strong** - Should only show high ABV drinks (>20%)
6. **Sweet** - Should only show drinks with juice or sweet liqueurs
7. **Surprise Me!** - Should show ONE random drink with "Surprise Me Again!" button

## 📝 Notes for Adding Your Own Recipes

When you add recipes via the Inventory page or directly to the database, make sure to include:

### Required Fields
```json
{
  "name": "Your Drink Name",
  "category": "cocktail|whiskey|wine|beer",
  "abv": 25,  // <-- Important for "strong" filtering!
  "ingredients": [
    {"name": "Vodka", "quantity": 50, "unit": "ml", "optional": false}
  ],
  "moods": ["strong", "sweet"],  // <-- Tags for mood matching
  "subcategory": "red"  // For wines: "red" or "white"
}
```

### For Best Matching

- **Sparkling drinks**: Include "Tonic Water", "Club Soda", "Soda Water", or "Prosecco" in ingredients
- **Hot drinks**: Include "temperature": "hot" field or "hot" in name/description
- **Light drinks**: Set ABV <= 15% or include "Light Tonic", "Club Soda", "Beer" in ingredients
- **Strong drinks**: Set ABV > 20%
- **Sweet drinks**: Include "Juice", "Simple Syrup", or sweet liqueurs in ingredients
- **Lazy drinks**: Set category to "whiskey" or "wine"

## 🧪 Test Locally First

Before deploying to AWS, test locally with mock backend:

```bash
# Make sure you're using mock mode
cd frontend
echo "VITE_USE_MOCK=true" > .env

# Run locally
npm run dev

# Test all moods to verify logic works
```

## 🔄 Quick Update Commands

```bash
# Update backend only
cd infrastructure && sam build && sam deploy --region us-west-2

# Update frontend (Amplify)
git add . && git commit -m "Update" && git push

# Update frontend (S3)
cd frontend && npm run build && aws s3 sync dist/ s3://YOUR_BUCKET/ --delete
```

## ✅ Verification Checklist

After deployment:
- [ ] Backend deployed successfully (no errors in terminal)
- [ ] Frontend rebuilt (check Amplify console or S3)
- [ ] Visit app URL
- [ ] Test "Lazy Night" - shows all whiskeys/wines organized by type
- [ ] Test "Surprise Me!" - shows random drink with "Surprise Me Again!" button
- [ ] Other moods filter correctly based on rules
- [ ] Can still add/edit inventory items

## 🐛 Troubleshooting

**"No matches found" for all moods:**
- Your recipes might not have the required fields (ABV, category, etc.)
- Add ABV field to existing recipes
- Update recipe moods tags

**Lazy mode shows empty:**
- No whiskey or wine in database
- Add some via Inventory page with category = "whiskey" or "wine"

**Strong drinks not showing:**
- Recipes missing ABV field
- Add "abv": 25 (or appropriate value) to recipes

**Frontend changes not showing:**
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Check correct API endpoint is configured
- Verify Amplify build completed successfully

## 📊 Expected Behavior

| Mood | What You'll See |
|------|----------------|
| Lazy Night | All whiskeys, all red wines, all white wines (organized sections) |
| Sparkling | Only drinks with sparkling ingredients |
| Warm | Only hot drinks |
| Light | Low-cal options (beer, tonic drinks, ABV ≤15%) |
| Strong | Only ABV >20% drinks |
| Sweet | Only drinks with juice/sweet liqueurs |
| Surprise Me! | ONE random drink |

Enjoy your personalized bartender with custom rules! 🍸
