import axios from 'axios';

// Create an axio instance for the Node.js backend
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Node.js backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPrediction = async (predictionData) => {
  try {
    const response = await apiClient.post('/predict', predictionData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error occurred while fetching ETA.');
    }
    throw new Error('Network error. Unable to connect to the server.');
  }
};

export const checkHealth = async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'error', message: 'Backend is unreachable' };
    }
};
