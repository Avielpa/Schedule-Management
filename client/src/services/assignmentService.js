import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

const assignmentService = {
  // Get all assignments
  getAll: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS, { params });
    return response.data;
  },

  // Get assignments in calendar format
  getCalendar: async (schedulingRunId) => {
    const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS_CALENDAR, {
      params: { scheduling_run: schedulingRunId }
    });
    return response.data;
  },

  // Get assignments by scheduling run
  getBySchedulingRun: async (schedulingRunId) => {
    const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS, {
      params: { scheduling_run: schedulingRunId }
    });
    return response.data;
  },

  // Get assignments by soldier
  getBySoldier: async (soldierId, schedulingRunId = null) => {
    const params = { soldier: soldierId };
    if (schedulingRunId) {
      params.scheduling_run = schedulingRunId;
    }
    const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS, { params });
    return response.data;
  },
};

export default assignmentService;
