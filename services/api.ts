import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = 'https://683470f2464b49963602da68.mockapi.io/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  async (config) => {
    try {
      // Import AsyncStorage dynamically to avoid circular dependency
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const token = await AsyncStorage.default.getItem('@finance_tracker_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to attach auth token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }

    if (!error.response) {
      // Network error
      throw new Error('Network Error. Please check your internet connection.');
    }

    // Handle HTTP status codes
    switch (error.response.status) {
      case 400:
        throw new Error('Bad request. Please check your input.');
      case 401:
        throw new Error('Unauthorized. Please login again.');
      case 403:
        throw new Error('Access denied. You don\'t have permission to perform this action.');
      case 404:
        // Check if this is an expense-related endpoint that should return empty array
        const url = error.config?.url || '';
        const isExpenseListEndpoint = 
          url.includes('/expenses') && 
          !url.match(/\/expenses\/[^\/]+$/); // Not a single expense endpoint (which ends with /expenses/{id})
        
        if (isExpenseListEndpoint) {
          // Return a mock response with empty array for expense list endpoints
          return Promise.resolve({
            ...error.response,
            data: [],
            status: 200,
            statusText: 'OK'
          });
        }
        throw new Error('Resource not found.');
      case 422:
        throw new Error('Validation error. Please check your input.');
      case 429:
        throw new Error('Too many requests. Please try again later.');
      case 500:
        throw new Error('Server error. Please try again later.');
      case 502:
      case 503:
      case 504:
        throw new Error('Service temporarily unavailable. Please try again later.');
      default:
        throw new Error(`Request failed with status ${error.response.status}`);
    }
  }
);

// Utility function to check network connectivity
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch {
    return false;
  }
};