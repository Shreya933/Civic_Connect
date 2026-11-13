// frontend/src/api/sysadminApi.js
import apiClient from './axios';
import { initialAllUsers, initialPendingStaff } from '../utils/constants';

const STAFF_STORAGE_KEY = 'civic_pending_staff';
const USERS_STORAGE_KEY = 'civic_all_users';

const getStoredStaff = () => {
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(initialPendingStaff));
      return initialPendingStaff;
    }
    return JSON.parse(raw);
  } catch {
    return initialPendingStaff;
  }
};

const saveStaff = (list) => {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save staff', err);
  }
};

const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialAllUsers));
      return initialAllUsers;
    }
    return JSON.parse(raw);
  } catch {
    return initialAllUsers;
  }
};

const saveUsers = (list) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save users', err);
  }
};

export const sysadminApi = {
  // System admin stats
  getDashboardStats: async () => {
    try {
      // In flask, we can calculate from users or stats
      const users = getStoredUsers();
      const staff = getStoredStaff();
      return {
        success: true,
        data: {
          total_users: users.length,
          citizens: users.filter((u) => u.role === 'CITIZEN').length,
          municipal_admins: users.filter((u) => u.role === 'ADMIN').length,
          higher_authority: users.filter((u) => u.role === 'HIGHER_AUTHORITY').length,
          system_admins: users.filter((u) => u.role === 'SYSTEM_ADMIN').length,
          pending_staff_approvals: staff.length,
        },
        isMock: true,
      };
    } catch (error) {
      throw error.message || 'Failed to fetch sysadmin statistics';
    }
  },

  // Get pending staff requests
  getPendingStaff: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/sysadmin/pending-staff?page=${page}&limit=${limit}`);
      const raw = response.data?.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.users) ? raw.users : []);
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const fallback = getStoredStaff();
        return { success: true, data: Array.isArray(fallback) ? fallback : [], isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch pending staff';
    }
  },

  // Approve staff request
  approveStaff: async (staffId, requestedRole = 'ADMIN') => {
    try {
      const response = await apiClient.patch(`/sysadmin/staff/${staffId}/approve`, {
        requested_role: requestedRole,
      });
      return { success: true, data: response.data?.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const staffList = getStoredStaff();
        const users = getStoredUsers();
        const staffMember = staffList.find((s) => s.id === staffId || s.user_id === staffId);

        const updatedStaff = staffList.filter((s) => s.id !== staffId && s.user_id !== staffId);
        saveStaff(updatedStaff);

        if (staffMember) {
          const newUser = {
            id: staffMember.user_id || 'usr-' + Date.now(),
            full_name: staffMember.full_name,
            email: staffMember.email,
            mobile: staffMember.mobile,
            role: requestedRole,
            account_status: 'ACTIVE',
            employee_id: staffMember.employee_id || `EMP-${requestedRole}-900`,
            designation: staffMember.designation,
            department: staffMember.department,
            jurisdiction: staffMember.jurisdiction,
            created_at: staffMember.created_at || new Date().toISOString(),
            last_login_at: null,
          };
          saveUsers([newUser, ...users]);
        }

        return {
          success: true,
          data: { status: 'ACTIVE', role: requestedRole },
          message: `Staff member approved and assigned role ${requestedRole} (Demo Mode)`,
          isMock: true,
        };
      }
      throw error.response?.data?.message || 'Failed to approve staff';
    }
  },

  // Reject staff request
  rejectStaff: async (staffId, reason) => {
    try {
      const response = await apiClient.patch(`/sysadmin/staff/${staffId}/reject`, { reason });
      return { success: true, data: response.data?.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const staffList = getStoredStaff();
        const updatedStaff = staffList.filter((s) => s.id !== staffId && s.user_id !== staffId);
        saveStaff(updatedStaff);
        return {
          success: true,
          data: { status: 'REJECTED' },
          message: 'Staff request rejected successfully (Demo Mode)',
          isMock: true,
        };
      }
      throw error.response?.data?.message || 'Failed to reject staff request';
    }
  },

  // Get all users with filters
  getAllUsers: async ({ page = 1, limit = 50, role, status, search } = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (role) params.append('role', role);
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await apiClient.get(`/sysadmin/users?${params.toString()}`);
      const raw = response.data?.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.users) ? raw.users : []);
      return { success: true, data: list, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        let list = getStoredUsers();
        if (role) {
          list = list.filter((u) => u.role === role);
        }
        if (status) {
          list = list.filter((u) => u.account_status === status);
        }
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(
            (u) =>
              u.full_name?.toLowerCase().includes(q) ||
              u.email?.toLowerCase().includes(q) ||
              u.employee_id?.toLowerCase().includes(q)
          );
        }
        return { success: true, data: list, isMock: true };
      }
      throw error.response?.data?.message || 'Failed to fetch users';
    }
  },

  // Update user status (ACTIVE / SUSPENDED)
  updateUserStatus: async (userId, newStatus) => {
    try {
      const response = await apiClient.patch(`/sysadmin/users/${userId}/status`, {
        account_status: newStatus,
      });
      return { success: true, data: response.data?.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const users = getStoredUsers();
        const updated = users.map((u) =>
          u.id === userId ? { ...u, account_status: newStatus } : u
        );
        saveUsers(updated);
        return {
          success: true,
          data: { id: userId, account_status: newStatus },
          message: `User status changed to ${newStatus} (Demo Mode)`,
          isMock: true,
        };
      }
      throw error.response?.data?.message || 'Failed to update user status';
    }
  },
};

export default sysadminApi;

