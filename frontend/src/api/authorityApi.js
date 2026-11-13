// frontend/src/api/authorityApi.js
import apiClient from './axios';
import {
  departmentPerformanceData,
  initialAuthorityActions,
  initialComplaints,
  monthlyTrendsData,
} from '../utils/constants';

const ACTIONS_STORAGE_KEY = 'civic_authority_actions';

const getStoredActions = () => {
  try {
    const raw = localStorage.getItem(ACTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(initialAuthorityActions));
      return initialAuthorityActions;
    }
    return JSON.parse(raw);
  } catch {
    return initialAuthorityActions;
  }
};

const saveActions = (list) => {
  try {
    localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save actions', err);
  }
};

export const authorityApi = {
  // Higher authority executive dashboard summary
  getDashboardData: async () => {
    try {
      const response = await apiClient.get('/authority/dashboard');
      return { success: true, data: response.data?.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        return {
          success: true,
          data: {
            total_complaints: 745,
            pending_review: 48,
            in_progress: 112,
            resolved: 556,
            rejected: 29,
            complaints_status_overdue: 18,
            currently_overdue_assignments: 18,
            historical_overdue_assignments: 64,
            resolution_rate: 74.6,
            departments: departmentPerformanceData.length,
            monthly_trends: monthlyTrendsData,
          },
          isMock: true,
        };
      }
      throw error.response?.data?.message || 'Failed to fetch executive dashboard';
    }
  },

  // Department-wise performance matrix
  getDepartmentPerformance: async () => {
    try {
      const response = await apiClient.get('/authority/department-performance');
      const raw = response.data?.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.departments) ? raw.departments : departmentPerformanceData);
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        return { success: true, data: departmentPerformanceData, isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch department performance';
    }
  },

  // Current overdue reports
  getCurrentOverdue: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/authority/overdue?page=${page}&limit=${limit}`);
      const raw = response.data?.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.assignments) ? raw.assignments : (Array.isArray(response.data?.assignments) ? response.data.assignments : []));
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const overdue = initialComplaints.filter((c) => c.status === 'OVERDUE');
        return { success: true, data: overdue, isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch current overdue reports';
    }
  },

  // Historical overdue reports (must preserve past overdue records even if resolved)
  getHistoricalOverdue: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/authority/historical-overdue?page=${page}&limit=${limit}`);
      const raw = response.data?.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.assignments) ? raw.assignments : (Array.isArray(response.data?.assignments) ? response.data.assignments : []));
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const historical = initialComplaints.filter((c) => c.assignment?.was_overdue === true);
        return { success: true, data: historical, isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch historical overdue reports';
    }
  },

  // List administrative actions
  getAdministrativeActions: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/authority/actions?page=${page}&limit=${limit}`);
      const raw = response.data?.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.actions) ? raw.actions : (Array.isArray(response.data?.actions) ? response.data.actions : []));
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        return { success: true, data: getStoredActions(), isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch administrative actions';
    }
  },

  // Create administrative action (warning, corrective measure, explanation request)
  createAction: async (actionData) => {
    try {
      const response = await apiClient.post('/authority/actions', actionData);
      return { success: true, data: response.data?.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const current = getStoredActions();
        const newAction = {
          id: 'act-' + Date.now(),
          ...actionData,
          status: 'OPEN',
          issued_at: new Date().toISOString(),
          issued_by: 'Higher Authority Commissioner',
        };
        const updated = [newAction, ...current];
        saveActions(updated);
        return {
          success: true,
          data: newAction,
          message: 'Administrative directive issued successfully (Demo Mode)',
          isMock: true,
        };
      }
      throw error.response?.data?.message || 'Failed to issue administrative action';
    }
  },

  // Close / acknowledge administrative action
  closeAction: async (actionId, resolutionData) => {
    try {
      const response = await apiClient.patch(`/authority/actions/${actionId}/close`, resolutionData);
      return { success: true, data: response.data?.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const current = getStoredActions();
        const updated = current.map((act) =>
          act.id === actionId
            ? {
                ...act,
                status: 'CLOSED',
                closed_at: new Date().toISOString(),
                resolution_notes: resolutionData.resolution_notes || 'Action acknowledged and resolved.',
              }
            : act
        );
        saveActions(updated);
        return {
          success: true,
          data: { id: actionId, status: 'CLOSED' },
          message: 'Action closed successfully (Demo Mode)',
          isMock: true,
        };
      }
      throw error.response?.data?.message || 'Failed to close action';
    }
  },
};

export default authorityApi;

