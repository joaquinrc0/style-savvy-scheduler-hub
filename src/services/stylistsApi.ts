import axios from 'axios';

// Helper function to get CSRF token from cookies
function getCsrfToken() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return value;
    }
  }
  return '';
}

// Configure axios defaults for this module
const axiosInstance = axios.create({
  withCredentials: true
});

// Add CSRF token to requests
axiosInstance.interceptors.request.use(config => {
  config.headers['X-CSRFToken'] = getCsrfToken();
  return config;
});

// Define types for the stylist data
export interface Stylist {
  id: string;
  name: string;
  specialties: string[];
  created_at?: string;
  updated_at?: string;
}

// API base URL - direct path to API
const API_BASE_URL = 'http://localhost:8000';

// Full endpoint URL for stylists including the 'ngo' path component
const STYLISTS_API_URL = `${API_BASE_URL}/django/api/stylists`;

// API service for stylists
const stylistsApi = {
  // Get all stylists
  getStylists: async (): Promise<Stylist[]> => {
    try {
      const response = await axiosInstance.get(`${STYLISTS_API_URL}/`);
      return response.data.map((stylist: any) => ({
        id: stylist.id.toString(),
        name: stylist.name,
        specialties: stylist.specialties || [],
        created_at: stylist.created_at,
        updated_at: stylist.updated_at
      }));
    } catch (error) {
      console.error('Error fetching stylists:', error);
      throw error;
    }
  },

  // Get a stylist by ID
  getStylist: async (id: string): Promise<Stylist> => {
    try {
      const numericId = id.replace(/^stylist-/, '');
      const response = await axiosInstance.get(`${STYLISTS_API_URL}/${numericId}/`);
      const stylist = response.data;
      return {
        id: stylist.id.toString(),
        name: stylist.name,
        specialties: stylist.specialties || [],
        created_at: stylist.created_at,
        updated_at: stylist.updated_at
      };
    } catch (error) {
      console.error(`Error fetching stylist ${id}:`, error);
      throw error;
    }
  },

  // Create a new stylist
  createStylist: async (stylistData: Omit<Stylist, 'id'>): Promise<Stylist> => {
    try {
      const response = await axiosInstance.post(`${STYLISTS_API_URL}/`, stylistData);
      const stylist = response.data;
      return {
        id: stylist.id.toString(),
        name: stylist.name,
        specialties: stylist.specialties || [],
        created_at: stylist.created_at,
        updated_at: stylist.updated_at
      };
    } catch (error) {
      console.error('Error creating stylist:', error);
      throw error;
    }
  },

  // Update an existing stylist
  updateStylist: async (id: string, stylistData: Partial<Stylist>): Promise<Stylist> => {
    try {
      const numericId = id.replace(/^stylist-/, '');
      const response = await axiosInstance.put(`${STYLISTS_API_URL}/${numericId}/`, stylistData);
      const stylist = response.data;
      return {
        id: stylist.id.toString(),
        name: stylist.name,
        specialties: stylist.specialties || [],
        created_at: stylist.created_at,
        updated_at: stylist.updated_at
      };
    } catch (error) {
      console.error(`Error updating stylist ${id}:`, error);
      throw error;
    }
  },

  // Delete a stylist
  deleteStylist: async (id: string): Promise<void> => {
    try {
      const numericId = id.replace(/^stylist-/, '');
      await axiosInstance.delete(`${STYLISTS_API_URL}/${numericId}/`);
    } catch (error) {
      console.error(`Error deleting stylist ${id}:`, error);
      throw error;
    }
  }
};

export default stylistsApi;
