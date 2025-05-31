import axios from 'axios';

// Define types for the stylist data
export interface Stylist {
  id: string;
  name: string;
  specialties: string[];
  created_at?: string;
  updated_at?: string;
}

// Transform backend response to frontend model
const transformStylistFromApi = (apiStylist: any): Stylist => {
  return {
    id: apiStylist.id.toString(),
    name: apiStylist.name,
    specialties: apiStylist.specialties || [],
    created_at: apiStylist.created_at,
    updated_at: apiStylist.updated_at
  };
};

// API base URL - direct path to stylists endpoint
const API_BASE_URL = 'http://localhost:8000/django/api';

// Helper to get the auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// API service for stylists
const stylistsApi = {
  // Get all stylists
  getStylists: async (): Promise<Stylist[]> => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/stylists/`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });
      return response.data.map(transformStylistFromApi);
    } catch (error) {
      console.error('Error fetching stylists:', error);
      throw error;
    }
  },

  // Get a stylist by ID
  getStylist: async (id: string): Promise<Stylist> => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/stylists/${id}/`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });
      return transformStylistFromApi(response.data);
    } catch (error) {
      console.error(`Error fetching stylist with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new stylist
  createStylist: async (stylistData: Omit<Stylist, 'id'>): Promise<Stylist> => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/stylists/`, stylistData, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });
      return transformStylistFromApi(response.data);
    } catch (error) {
      console.error('Error creating stylist:', error);
      throw error;
    }
  },

  // Update an existing stylist
  updateStylist: async (id: string, stylistData: Partial<Stylist>): Promise<Stylist> => {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/stylists/${id}/`, stylistData, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });
      return transformStylistFromApi(response.data);
    } catch (error) {
      console.error(`Error updating stylist with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a stylist
  deleteStylist: async (id: string): Promise<void> => {
    try {
      const token = getAuthToken();
      await axios.delete(`${API_BASE_URL}/stylists/${id}/`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      });
    } catch (error) {
      console.error(`Error deleting stylist with ID ${id}:`, error);
      throw error;
    }
  }
};

export default stylistsApi;
