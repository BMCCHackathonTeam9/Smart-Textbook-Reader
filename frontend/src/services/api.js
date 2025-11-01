import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for large file processing
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Request being made - could add analytics here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // API Error - handled by calling components
    return Promise.reject(error);
  }
);

export const textbookAPI = {
  // Process PDF file - extract text and generate audio
  processPDF: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await api.post('/api/process-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to process PDF'
      );
    }
  },

  // Convert text to speech
  textToSpeech: async (text) => {
    try {
      const response = await api.post('/api/text-to-speech', { text });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to convert text to speech'
      );
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend service is not available');
    }
  },

  // Get audio file
  getAudioURL: (filename) => {
    const baseUrl = process.env.REACT_APP_API_URL || 
      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
    return `${baseUrl}/api/audio/${filename}`;
  },
};

export default api;