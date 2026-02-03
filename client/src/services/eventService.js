import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

const eventService = {
  // Get all events
  getAll: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.EVENTS, { params });
    return response.data;
  },

  // Get single event
  getById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.EVENT_DETAIL(id));
    return response.data;
  },

  // Create event
  create: async (eventData) => {
    const response = await apiClient.post(API_ENDPOINTS.EVENTS, eventData);
    return response.data;
  },

  // Update event
  update: async (id, eventData) => {
    const response = await apiClient.put(API_ENDPOINTS.EVENT_DETAIL(id), eventData);
    return response.data;
  },

  // Partial update event
  partialUpdate: async (id, eventData) => {
    const response = await apiClient.patch(API_ENDPOINTS.EVENT_DETAIL(id), eventData);
    return response.data;
  },

  // Delete event
  delete: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.EVENT_DETAIL(id));
    return response.data;
  },
};

export default eventService;
