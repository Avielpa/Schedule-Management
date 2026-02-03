import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

const soldierService = {
  // Get all soldiers
  getAll: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SOLDIERS, { params });
    return response.data;
  },

  // Get single soldier
  getById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.SOLDIER_DETAIL(id));
    return response.data;
  },

  // Create soldier
  create: async (soldierData) => {
    const response = await apiClient.post(API_ENDPOINTS.SOLDIERS, soldierData);
    return response.data;
  },

  // Bulk create soldiers
  bulkCreate: async (soldiersData) => {
    const response = await apiClient.post(API_ENDPOINTS.SOLDIERS_BULK_CREATE, soldiersData);
    return response.data;
  },

  // Update soldier
  update: async (id, soldierData) => {
    const response = await apiClient.put(API_ENDPOINTS.SOLDIER_DETAIL(id), soldierData);
    return response.data;
  },

  // Partial update soldier
  partialUpdate: async (id, soldierData) => {
    const response = await apiClient.patch(API_ENDPOINTS.SOLDIER_DETAIL(id), soldierData);
    return response.data;
  },

  // Delete soldier
  delete: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.SOLDIER_DETAIL(id));
    return response.data;
  },

  // Get soldiers by event
  getByEvent: async (eventId) => {
    const response = await apiClient.get(API_ENDPOINTS.SOLDIERS, {
      params: { event: eventId }
    });
    return response.data;
  },
};

export default soldierService;
