import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Forms API
export const formsAPI = {
    getForms: () => api.get('/forms'),
    getForm: (id) => api.get(`/forms/${id}`),
    createForm: (data) => api.post('/forms', data),
    updateForm: (id, data) => api.put(`/forms/${id}`, data),
    deleteForm: (id) => api.delete(`/forms/${id}`),
    publishForm: (id) => api.post(`/forms/${id}/publish`),
    getFormByShareLink: (shareLink) => api.get(`/forms/share/${shareLink}`),
};

// AI API
export const aiAPI = {
    generateForm: (description) => api.post('/ai/generate-form', { description }),
};

// Responses API
export const responsesAPI = {
    submitResponse: (formId, answers) => api.post(`/responses/${formId}`, { answers }),
    getFormResponses: (formId) => api.get(`/responses/form/${formId}`),
    exportResponses: (formId) => api.get(`/responses/export/${formId}`, { responseType: 'blob' }),
};
