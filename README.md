# MyHomeBar - Personal Bartender Recommendation System

A web application that recommends drinks based on your mood, preferences, and available home bar inventory.

## Features

- **Mood-based Recommendations**: Get drink suggestions based on your current mood or preferences
- **Inventory Management**: Track your spirits, mixers, fruits, and other ingredients with expiration dates
- **Smart Matching**: Automatically suggests drinks you can make with available ingredients
- **Top 3 Recommendations**: Curated suggestions tailored to your selection

## Architecture

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   React App     │ ← Hosted on S3
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌─────────┐    ┌──────────┐
    │Inventory│    │Recipes │    │Recommend│    │   More   │
    │ Lambda  │    │ Lambda │    │ Lambda  │    │  Future  │
    └────┬───┘    └────┬───┘    └────┬────┘    └──────────┘
         │             │              │
         └─────────────┴──────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   DynamoDB     │
              ├────────────────┤
              │ • Inventory    │
              │ • Recipes      │
              └────────────────┘
```

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: AWS Lambda + API Gateway (Serverless)
- **Database**: DynamoDB
- **Infrastructure**: AWS SAM (Serverless Application Model)
- **Hosting**: S3 + CloudFront (optional)

## Project Structure

```
MyHomeBar/
├── backend/                 # Lambda functions and API logic
│   ├── src/
│   │   └── functions/      # Lambda function handlers
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── services/      # API integration
│   └── package.json
└── infrastructure/         # AWS SAM templates
    └── template.yaml
```

## Database Schema

### Inventory Table
- Tracks all ingredients with quantities and expiration dates
- Categories: spirits, liqueurs, mixers, fruits, herbs, wine, whiskey

### Recipes Table
- Drink recipes with required ingredients
- Tagged with mood/preference attributes
- Difficulty levels and preparation instructions

## Quick Start

### Run Locally (No AWS Required)

```bash
cd frontend
cp .env.mock .env
npm install
npm run dev
```

Visit http://localhost:3000 - See [LOCAL_QUICKSTART.md](LOCAL_QUICKSTART.md)

### Deploy to AWS

```bash
aws configure
chmod +x deploy.sh
./deploy.sh
```

For detailed instructions, see [QUICKSTART.md](QUICKSTART.md) or [DEPLOYMENT.md](DEPLOYMENT.md).

## Local Development

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:3000

**Note**: For local development, you'll need to either:
1. Point to deployed AWS backend, or
2. Use SAM local: `sam local start-api` in the infrastructure directory

## Mood/Preference Options

- Lazy (no mixing required) → Neat spirits or wine
- Sparkling → Champagne cocktails, fizzy drinks
- Warm/Hot → Hot toddies, Irish coffee
- Light → Low-ABV, refreshing cocktails
- Strong → Spirit-forward cocktails
- Sweet → Fruity, dessert cocktails
- Sour → Citrus-based cocktails

## License

Personal project