import axios from 'axios';

// API base URL - update this after deploying to AWS
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inventory API
export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getExpiring: (days = 7) => api.get(`/inventory/expiring?days=${days}`),
};

// Recipes API
export const recipesApi = {
  getAll: () => api.get('/recipes'),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
};

// Recommendations API
export const recommendationsApi = {
  get: (moods, showAll = false) =>
    api.post('/recommendations', { moods, showAll }),
};

// Image Upload API
export const imageApi = {
  uploadImage: async (file) => {
    try {
      // Step 1: Get presigned URL from Lambda
      const { data } = await api.post('/images/upload-url', {
        fileName: file.name,
        fileType: file.type,
      });

      const { uploadUrl, publicUrl } = data;

      // Step 2: Upload file directly to S3 using presigned URL
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // Step 3: Return the public URL
      return { data: { url: publicUrl } };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },
};

export default api;
