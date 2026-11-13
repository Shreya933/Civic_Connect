// frontend/src/api/adminApi.js
import apiClient from './axios';
import { initialComplaints } from '../utils/constants';

const STORAGE_KEY = 'civic_mock_complaints';

const getStoredComplaints = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialComplaints));
      return initialComplaints;
    }
    return JSON.parse(raw);
  } catch {
    return initialComplaints;
  }
};

const saveComplaints = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
};

export const adminApi = {
  // Dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard-stats');
      return { success: true, data: response.data?.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const stored = getStoredComplaints();
        const pending = stored.filter((c) => c.status === 'PENDING_REVIEW').length;
        const inProgress = stored.filter((c) => c.status === 'IN_PROGRESS').length;
        const resolved = stored.filter((c) => c.status === 'RESOLVED').length;
        const rejected = stored.filter((c) => c.status === 'REJECTED').length;
        const overdue = stored.filter((c) => c.status === 'OVERDUE').length;
        const historical = stored.filter((c) => c.assignment?.was_overdue).length;

        return {
          success: true,
          data: {
            total_complaints: stored.length,
            pending_review: pending,
            in_progress: inProgress,
            resolved: resolved,
            rejected: rejected,
            overdue_assignments: overdue,
            historical_overdue: historical,
          },
          isMock: true,
        };
      }
      throw error.response?.data?.message || 'Failed to fetch admin dashboard statistics';
    }
  },

  // Get pending complaints
  getPendingComplaints: async () => {
    try {
      const response = await apiClient.get('/admin/complaints/pending');
      const raw = response.data?.complaints;
      const list = Array.isArray(raw) ? raw : (Array.isArray(response.data?.data) ? response.data.data : []);
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const stored = getStoredComplaints();
        const pending = stored.filter((c) => c.status === 'PENDING_REVIEW');
        return { success: true, data: pending, isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch pending complaints';
    }
  },

  // Approve and assign complaint
  approveComplaint: async (complaintId, payload) => {
    try {
      const response = await apiClient.post(`/admin/complaints/${complaintId}/approve`, payload);
      return { success: true, data: response.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const stored = getStoredComplaints();
        const reportId = `REP-2026-${Math.floor(100 + Math.random() * 900)}`;
        
        const updated = stored.map((item) => {
          if (item.complaint_id === complaintId || item.id === complaintId) {
            return {
              ...item,
              status: 'IN_PROGRESS',
              priority: payload.priority || item.priority || 'MEDIUM',
              assignment: {
                report_id: reportId,
                department: payload.department_name || 'Public Works & Roads',
                department_id: payload.department_id,
                worker_name: payload.worker_name || `${payload.worker_count || 3} Field Crew Technicians`,
                worker_count: payload.worker_count || 3,
                assigned_at: new Date().toISOString(),
                deadline_at: payload.deadline || new Date(Date.now() + 86400000 * 3).toISOString(),
                status: 'IN_PROGRESS',
                was_overdue: false,
              },
            };
          }
          return item;
        });

        saveComplaints(updated);

        return {
          success: true,
          data: {
            report_id: reportId,
            assignment_id: 'asg-' + Date.now(),
            status: 'IN_PROGRESS',
            message: 'Complaint approved and assigned (Demo Mode)',
          },
          isMock: true,
        };
      }
      throw error.response?.data?.message || error.response?.data?.errors?.[0] || 'Approval failed';
    }
  },

  // Reject complaint with mandatory reason
  rejectComplaint: async (complaintId, reason) => {
    try {
      const response = await apiClient.post(`/admin/complaints/${complaintId}/reject`, { reason });
      return { success: true, data: response.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const stored = getStoredComplaints();
        const updated = stored.map((item) => {
          if (item.complaint_id === complaintId || item.id === complaintId) {
            return {
              ...item,
              status: 'REJECTED',
              rejection_reason: reason,
              rejected_at: new Date().toISOString(),
            };
          }
          return item;
        });
        saveComplaints(updated);
        return {
          success: true,
          data: {
            complaint_id: complaintId,
            status: 'REJECTED',
            message: 'Complaint rejected successfully (Demo Mode)',
          },
          isMock: true,
        };
      }
      throw error.response?.data?.message || 'Rejection failed';
    }
  },

  // Get in-progress assignments
  getInProgressAssignments: async () => {
    try {
      const response = await apiClient.get('/admin/assignments/in-progress');
      const raw = response.data?.assignments;
      const list = Array.isArray(raw) ? raw : (Array.isArray(response.data?.data) ? response.data.data : []);
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const stored = getStoredComplaints();
        const inProgress = stored.filter((c) => c.status === 'IN_PROGRESS');
        return { success: true, data: inProgress, isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch in-progress assignments';
    }
  },

  // Get overdue assignments
  getOverdueAssignments: async () => {
    try {
      const response = await apiClient.get('/admin/assignments/overdue');
      const raw = response.data?.assignments;
      const list = Array.isArray(raw) ? raw : (Array.isArray(response.data?.data) ? response.data.data : []);
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const stored = getStoredComplaints();
        const overdue = stored.filter((c) => c.status === 'OVERDUE');
        return { success: true, data: overdue, isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch overdue assignments';
    }
  },

  // Get historical overdue assignments
  getHistoricalOverdueAssignments: async () => {
    try {
      const response = await apiClient.get('/admin/assignments/historical-overdue');
      const raw = response.data?.assignments;
      const list = Array.isArray(raw) ? raw : (Array.isArray(response.data?.data) ? response.data.data : []);
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const stored = getStoredComplaints();
        const historical = stored.filter((c) => c.assignment?.was_overdue === true);
        return { success: true, data: historical, isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch historical overdue assignments';
    }
  },

  // Get resolved assignments
  getResolvedAssignments: async () => {
    try {
      // In Flask, resolved can be filtered from assignments or complaints
      const response = await apiClient.get('/admin/assignments/resolved');
      const raw = response.data?.assignments;
      const list = Array.isArray(raw) ? raw : (Array.isArray(response.data?.data) ? response.data.data : []);
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        const stored = getStoredComplaints();
        const resolved = stored.filter((c) => c.status === 'RESOLVED');
        return { success: true, data: resolved, isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch resolved assignments';
    }
  },

  // Resolve assignment with completion proof image & note
  resolveAssignment: async (assignmentIdOrComplaintId, formData) => {
    try {
      const response = await apiClient.post(
        `/admin/assignments/${assignmentIdOrComplaintId}/resolve`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return { success: true, data: response.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const stored = getStoredComplaints();
        const completionNote = formData.get('completion_note') || 'Field inspection confirmed satisfactory repair.';
        let completionImageUrl = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80';
        
        const file = formData.get('completion_image');
        if (file && typeof file === 'object' && file.name) {
          try {
            completionImageUrl = URL.createObjectURL(file);
          } catch {
            // fallback
          }
        }

        const updated = stored.map((item) => {
          if (
            item.complaint_id === assignmentIdOrComplaintId ||
            item.id === assignmentIdOrComplaintId ||
            item.assignment?.report_id === assignmentIdOrComplaintId
          ) {
            return {
              ...item,
              status: 'RESOLVED',
              assignment: {
                ...(item.assignment || {}),
                status: 'RESOLVED',
                completed_at: new Date().toISOString(),
                completion_image: completionImageUrl,
                completion_note: completionNote,
                deadline_met: item.status !== 'OVERDUE',
              },
            };
          }
          return item;
        });

        saveComplaints(updated);

        return {
          success: true,
          data: {
            report_id: 'REP-RESOLVED',
            assignment_status: 'RESOLVED',
            complaint_status: 'RESOLVED',
            message: 'Assignment resolved successfully (Demo Mode)',
          },
          isMock: true,
        };
      }
      throw error.response?.data?.message || 'Resolution submission failed';
    }
  },

  // Trigger overdue check
  checkOverdue: async () => {
    try {
      const response = await apiClient.post('/admin/check-overdue');
      return { success: true, data: response.data?.data, isMock: false };
    } catch (error) {
      return { success: true, data: { checked: true }, isMock: true };
    }
  },

  // Get active departments list
  getDepartments: async () => {
    try {
      const response = await apiClient.get('/admin/departments');
      return { success: true, data: response.data?.departments || [], isMock: false };
    } catch (error) {
      return {
        success: true,
        data: [
          { id: 'dept-roads', name: 'Roads & Traffic Infrastructure' },
          { id: 'dept-waste', name: 'Solid Waste & Sanitation' },
          { id: 'dept-water', name: 'Water Supply & Drainage' },
          { id: 'dept-electric', name: 'Street Lighting & Electrical' },
          { id: 'dept-health', name: 'Public Health & Environment' },
        ],
        isMock: true,
      };
    }
  },

  // Get complaint details for review
  getComplaintDetails: async (complaintId) => {
    try {
      const response = await apiClient.get(`/admin/complaints/${complaintId}`);
      return { success: true, data: response.data?.complaint, isMock: false };
    } catch (error) {
      const stored = getStoredComplaints();
      const found = stored.find((c) => c.complaint_id === complaintId || c.id === complaintId);
      return { success: true, data: found, isMock: true };
    }
  },
};

export default adminApi;

