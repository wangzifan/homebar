// Centralized API service
// Automatically switches between mock and real API based on environment

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK === 'true';

// Import both APIs
import * as realApi from './api.js';
import * as mockApi from './mockApi.js';

// Select which one to use based on environment
const selectedApi = USE_MOCK_API ? mockApi : realApi;

// Log which API is being used
if (USE_MOCK_API) {
  console.log('🎭 Using Mock API - No backend required');
} else {
  console.log('🌐 Using Real API -', import.meta.env.VITE_API_URL || 'No API URL configured');
}

// Export the selected API
export const inventoryApi = selectedApi.inventoryApi;
export const recipesApi = selectedApi.recipesApi;
export const recommendationsApi = selectedApi.recommendationsApi;
export const imageApi = selectedApi.imageApi;

export default selectedApi.default;
