import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

const schedulingRunService = {
  // Get all scheduling runs
  getAll: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SCHEDULING_RUNS, { params });
    return response.data;
  },

  // Get single scheduling run
  getById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.SCHEDULING_RUN_DETAIL(id));
    return response.data;
  },

  // Create scheduling run
  create: async (runData) => {
    const response = await apiClient.post(API_ENDPOINTS.SCHEDULING_RUNS, runData);
    return response.data;
  },

  // Update scheduling run
  update: async (id, runData) => {
    const response = await apiClient.put(API_ENDPOINTS.SCHEDULING_RUN_DETAIL(id), runData);
    return response.data;
  },

  // Delete scheduling run
  delete: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.SCHEDULING_RUN_DETAIL(id));
    return response.data;
  },

  // Execute algorithm
  executeAlgorithm: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.EXECUTE_ALGORITHM(id), {});
    return response.data;
  },

  // Get runs by event
  getByEvent: async (eventId) => {
    const response = await apiClient.get(API_ENDPOINTS.SCHEDULING_RUNS, {
      params: { event: eventId }
    });
    return response.data;
  },
};

export default schedulingRunService;
