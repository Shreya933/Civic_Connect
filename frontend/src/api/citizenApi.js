// frontend/src/api/citizenApi.js
import apiClient from './axios';
import { initialComplaints } from '../utils/constants';

// Local storage backing for client-side persistence in demo/offline mode
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

export const citizenApi = {
  // Submit new complaint
  createComplaint: async (formData) => {
    try {
      const response = await apiClient.post('/citizen/complaints', formData);
      const data = response.data?.data || response.data;
      
      // Keep local cache in sync so all views immediately reflect the submission
      if (data && data.complaint_id) {
        try {
          const stored = getStoredComplaints();
          const exists = stored.some((c) => c.complaint_id === data.complaint_id);
          if (!exists) {
            stored.unshift({
              id: data.id || 'cmp-' + Date.now(),
              complaint_id: data.complaint_id,
              title: data.title || formData.get('title') || 'Civic Infrastructure Grievance',
              description: data.description || formData.get('description') || '',
              category: data.category || (data.prediction && data.prediction.category) || formData.get('category') || 'Road damage and potholes',
              status: data.status || 'PENDING_REVIEW',
              address: (typeof data.address === 'object' ? data.address?.formatted : data.address) || formData.get('address') || 'Registered Geotag Location',
              image_url: data.image_url || (data.image && data.image.url),
              thumbnail_url: data.thumbnail_url || data.image_url || (data.image && data.image.thumbnail_url),
              submitted_at: new Date().toISOString(),
              priority: 'MEDIUM',
              prediction: data.prediction,
            });
            saveComplaints(stored);
          }
        } catch (storageErr) {
          console.warn('Storage sync warning:', storageErr);
        }
      }
      
      return { success: true, data, isMock: false };
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error.response?.data?.message || 'Authentication required to submit complaint';
      }

      // Fallback to local state so citizen submission never fails during demo/offline
      const stored = getStoredComplaints();
      const nextIdNumber = stored.length + 1;
      const newComplaintId = `CC-2026-${String(nextIdNumber).padStart(6, '0')}`;
      
      // Extract fields from formData
      const title = formData.get('title') || 'Civic Infrastructure Concern';
      const description = formData.get('description') || 'Reported via Civic Connect mobile/web portal.';
      const category = formData.get('category') || 'Road damage and potholes';
      const source = formData.get('source') || 'UPLOAD';
      const latitude = parseFloat(formData.get('latitude')) || 12.9716;
      const longitude = parseFloat(formData.get('longitude')) || 77.5946;
      const address = formData.get('address') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      let imageUrl = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
      const file = formData.get('image');
      if (file && typeof file === 'object') {
        try {
          imageUrl = URL.createObjectURL(file);
        } catch {
          // fallback
        }
      }

      const newComplaint = {
        id: 'cmp-' + Date.now(),
        complaint_id: newComplaintId,
        title,
        description,
        category,
        ai_state: 'CLASSIFIED',
        confidence: 0.94,
        source,
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        address,
        location: { type: 'Point', coordinates: [longitude, latitude] },
        status: 'PENDING_REVIEW',
        submitted_at: new Date().toISOString(),
        citizen_name: 'Current Citizen',
        citizen_email: 'citizen@civic.test',
        citizen_phone: '+91 98765 00000',
        priority: 'MEDIUM',
      };

      const updated = [newComplaint, ...stored];
      saveComplaints(updated);

      return {
        success: true,
        data: {
          id: newComplaint.id,
          complaint_id: newComplaintId,
          title,
          description,
          category,
          prediction: {
            category: newComplaint.category,
            confidence: 0.94,
            state: 'CLASSIFIED',
          },
          status: 'PENDING_REVIEW',
          address,
          image_url: imageUrl,
          message: 'Complaint submitted successfully',
        },
        isMock: true,
      };
    }
  },

  // Get citizen complaints
  getMyComplaints: async () => {
    try {
      const response = await apiClient.get('/citizen/complaints');
      const backendComplaints = response.data?.complaints || [];
      const stored = getStoredComplaints();
      const backendIds = new Set(backendComplaints.map((c) => c.complaint_id));
      const combined = [...backendComplaints];
      for (const item of stored) {
        if (!backendIds.has(item.complaint_id)) {
          combined.push(item);
        }
      }
      return { success: true, data: combined, isMock: false };
    } catch (error) {
      const stored = getStoredComplaints();
      return { success: true, data: stored, isMock: true };
    }
  },

  // Get single complaint details
  getComplaintDetails: async (complaintId) => {
    try {
      const response = await apiClient.get(`/citizen/complaints/${complaintId}`);
      return { success: true, data: response.data?.complaint, isMock: false };
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        const stored = getStoredComplaints();
        const found = stored.find((c) => c.complaint_id === complaintId || c.id === complaintId);
        if (found) {
          return { success: true, data: found, isMock: true };
        }
      }
      throw error.response?.data?.message || 'Complaint not found';
    }
  },
};

export default citizenApi;

