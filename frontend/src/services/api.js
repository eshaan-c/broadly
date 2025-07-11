import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = {
    // Get all programs
    getPrograms: async (filters = {}) => {
        const response = await axios.get(`${API_BASE_URL}/programs`, { params: filters });
        return response.data;
    },

    // Get single program
    getProgram: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/programs/${id}`);
        return response.data;
    },

    // Search programs with preferences
    searchPrograms: async (preferences) => {
        const response = await axios.post(`${API_BASE_URL}/programs/search`, preferences);
        return response.data;
    },

    // Compare programs
    comparePrograms: async (programIds) => {
        const response = await axios.post(`${API_BASE_URL}/programs/compare`, { program_ids: programIds });
        return response.data;
    },

    // Get filter options
    getFilters: async () => {
        const response = await axios.get(`${API_BASE_URL}/programs/filters`);
        return response.data;
    },
};

export default api;