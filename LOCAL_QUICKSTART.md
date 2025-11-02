# Run Locally in 2 Minutes

No AWS account needed! Run with mock backend for instant local development.

## Quick Start

```bash
# 1. Navigate to frontend
cd frontend

# 2. Copy mock environment config
cp .env.mock .env

# 3. Install dependencies
npm install

# 4. Start the app
npm run dev
```

That's it! Open http://localhost:3000 in your browser.

## What You Get

- ✅ Full working application
- ✅ 12 pre-loaded cocktail recipes
- ✅ 24 sample inventory items
- ✅ All features working (recommendations, inventory management)
- ✅ No AWS account required
- ✅ No backend setup needed

## How It Works

The app uses a mock API (`frontend/src/services/mockApi.js`) that simulates the backend in your browser's memory. All the sample recipes and inventory data are pre-loaded.

## Features Available

1. **Home Page**: Select mood/preferences
2. **Recommendations**: Get top 3 drink matches
3. **Inventory Management**: Add, edit, delete items
4. **Expiration Tracking**: See expiring ingredients

## Limitations

- Data resets when you refresh the page
- No actual database persistence
- Perfect for UI development and testing

## Switch to Real Backend

When ready to use AWS backend:

```bash
# 1. Deploy backend to AWS
cd infrastructure
sam build
sam deploy --guided

# 2. Update frontend config
cd ../frontend
cat > .env << EOF
VITE_USE_MOCK=false
VITE_API_URL=YOUR_API_ENDPOINT_HERE
EOF

# 3. Restart
npm run dev
```

## Troubleshooting

### Port 3000 already in use?
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

### Changes not showing?
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache
- Check browser console for errors

### "Mock data not loading"?
- Verify `.env` has `VITE_USE_MOCK=true`
- Check browser console: should see "🎭 Using Mock API"
- Restart dev server: Ctrl+C then `npm run dev`

## Next Steps

1. **Play with the UI**: Try different moods and combinations
2. **Modify Data**: Edit `backend/src/data/sample-*.json` files
3. **Customize Styles**: Update CSS files in `frontend/src/`
4. **Add Features**: Extend the mock API or add new pages

Happy coding! 🍸
