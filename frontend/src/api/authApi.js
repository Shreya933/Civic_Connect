// frontend/src/api/authApi.js
import apiClient from './axios';
import { initialAllUsers } from '../utils/constants';

export const authApi = {
  // Citizen login
  loginCitizen: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login/citizen', credentials);
      return { success: true, data: response.data?.data || response.data, isMock: false };
    } catch (error) {
      // Graceful demo fallback if Flask is not responding
      if (!error.response || error.code === 'ERR_NETWORK') {
        const found = initialAllUsers.find(
          (u) => u.email.toLowerCase() === credentials.email?.toLowerCase() && u.role === 'CITIZEN'
        );
        if (found) {
          const mockAuth = {
            user_id: found.id,
            full_name: found.full_name,
            email: found.email,
            role: 'CITIZEN',
            token: 'demo-jwt-token-citizen-xyz123',
          };
          return { success: true, data: mockAuth, isMock: true };
        }
      }
      throw error.response?.data?.message || error.message || 'Login failed';
    }
  },

  // Citizen registration
  registerCitizen: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register/citizen', userData);
      return { success: true, data: response.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        return {
          success: true,
          data: {
            user_id: 'usr-cit-' + Date.now(),
            role: 'CITIZEN',
            message: 'Citizen registered successfully (Demo Mode)',
          },
          isMock: true,
        };
      }
      throw error.response?.data?.message || error.response?.data?.errors?.[0] || 'Registration failed';
    }
  },

  // Staff login step 1 (Sends OTP)
  loginStaff: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login/staff', credentials);
      return { success: true, data: response.data?.data || response.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const found = initialAllUsers.find(
          (u) => u.email.toLowerCase() === credentials.email?.toLowerCase() && u.role !== 'CITIZEN'
        );
        if (found) {
          return {
            success: true,
            data: {
              user_id: found.id,
              email: found.email,
              role: found.role,
              otp_sent: true,
              mockOtpCode: '123456', // For demo convenience
            },
            isMock: true,
          };
        }
      }
      throw error.response?.data?.message || error.message || 'Staff login failed';
    }
  },

  // Staff OTP verification
  verifyOtp: async ({ user_id, email, otp }) => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { user_id, email, otp });
      return { success: true, data: response.data?.data || response.data, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const found = initialAllUsers.find((u) => u.id === user_id || u.email === email) || initialAllUsers[0];
        if (otp === '123456' || otp?.length === 6) {
          return {
            success: true,
            data: {
              user_id: found.id,
              full_name: found.full_name,
              email: found.email,
              role: found.role,
              token: `demo-jwt-token-${found.role.toLowerCase()}-abc987`,
            },
            isMock: true,
          };
        }
        throw 'Invalid OTP code. For demo mode, enter 123456.';
      }
      throw error.response?.data?.message || 'OTP verification failed';
    }
  },

  // Staff registration request (requires sysadmin approval)
  registerStaff: async (staffData) => {
    try {
      // If backend has staff register route, call it
      const response = await apiClient.post('/auth/register/staff', staffData);
      return { success: true, data: response.data, isMock: false };
    } catch (error) {
      // In offline/mock mode, simulate queueing for sysadmin
      return {
        success: true,
        data: {
          staff_id: 'staff-req-' + Date.now(),
          message: 'Staff access request registered. Status: Pending System Administrator approval.',
        },
        isMock: true,
      };
    }
  },
};

export default authApi;

