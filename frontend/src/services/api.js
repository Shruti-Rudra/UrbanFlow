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

// Transit Data
export const getStations = () => apiClient.get('/transit/stations').then(res => res.data);
export const createStation = (data) => apiClient.post('/transit/stations', data).then(res => res.data);
export const updateStation = (id, data) => apiClient.put(`/transit/stations/${id}`, data).then(res => res.data);
export const deleteStation = (id) => apiClient.delete(`/transit/stations/${id}`).then(res => res.data);

export const getRoutes = () => apiClient.get('/transit/routes').then(res => res.data);
export const createRoute = (data) => apiClient.post('/transit/routes', data).then(res => res.data);
export const updateRoute = (id, data) => apiClient.put(`/transit/routes/${id}`, data).then(res => res.data);
export const deleteRoute = (id) => apiClient.delete(`/transit/routes/${id}`).then(res => res.data);

export const getBuses = () => apiClient.get('/transit/buses').then(res => res.data);
export const createBus = (data) => apiClient.post('/transit/buses', data).then(res => res.data);
export const updateBus = (id, data) => apiClient.put(`/transit/buses/${id}`, data).then(res => res.data);
export const deleteBus = (id) => apiClient.delete(`/transit/buses/${id}`).then(res => res.data);

export const getNearbyStations = (lat, lng) => apiClient.get(`/transit/nearby?lat=${lat}&lng=${lng}`).then(res => res.data);

// Auth & OTP
export const requestOTP = (identifier) => apiClient.post('/auth/request-otp', { identifier }).then(res => res.data);
export const verifyOTP = (identifier, otp) => apiClient.post('/auth/verify-otp', { identifier, otp }).then(res => res.data);
