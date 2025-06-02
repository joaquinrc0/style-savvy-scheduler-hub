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

// Configure axios defaults
axios.defaults.withCredentials = true; // Send cookies with requests
axios.defaults.headers.common['X-CSRFToken'] = getCsrfToken();

// Define types for the client data
export interface Client {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender?: string;
  birthdate?: string | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// API base URL - direct path to clients endpoint
const API_BASE_URL = 'http://localhost:8000/django/api';

// API service for clients
const clientsApi = {
  // Get all clients
  getClients: async (): Promise<Client[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  // Get a client by ID
  getClient: async (id: number): Promise<Client> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new client
  createClient: async (clientData: Client): Promise<Client> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/clients/`, clientData);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  // Update an existing client
  updateClient: async (id: number, clientData: Partial<Client>): Promise<Client> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/clients/${id}/`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a client
  deleteClient: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/clients/${id}/`);
    } catch (error) {
      console.error(`Error deleting client with ID ${id}:`, error);
      throw error;
    }
  },

  // Search clients
  searchClients: async (query: string): Promise<Client[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }
};

export default clientsApi;
