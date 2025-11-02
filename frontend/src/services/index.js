// Centralized API service
// Automatically switches between mock and real API based on environment

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK === 'true';

let api;

if (USE_MOCK_API) {
  console.log('🎭 Using Mock API - No backend required');
  api = await import('./mockApi.js');
} else {
  console.log('🌐 Using Real API -', import.meta.env.VITE_API_URL || 'No API URL configured');
  api = await import('./api.js');
}

export const inventoryApi = api.inventoryApi;
export const recipesApi = api.recipesApi;
export const recommendationsApi = api.recommendationsApi;

export default api.default;
