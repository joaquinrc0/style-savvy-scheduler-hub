// src/services/serviceApi.ts
import { Service } from "@/types/appointment";
import { API_BASE_URL } from "@/config";

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

// Use the centralized API configuration
const SERVICES_API_URL = `${API_BASE_URL}/api/services/`;

// Helper to parse service from API response
const parseServiceFromAPI = (apiService: any): Service => {
  return {
    id: apiService.id.toString(),
    name: apiService.name,
    description: apiService.description,
    duration: apiService.duration,
    price: Number(apiService.price),
  };
};

// Fetch all services
export const fetchServices = async (): Promise<Service[]> => {
  try {
    console.log(`Fetching services from: ${SERVICES_API_URL}`);
    
    const response = await fetch(SERVICES_API_URL, {
      method: 'GET',
      credentials: 'include',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to fetch services" }));
      throw new Error(errorData.detail || "Failed to fetch services");
    }
    
    const data = await response.json();
    return (data || []).map(parseServiceFromAPI);
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

// Create a new service
export const createService = async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
  try {
    console.log(`Creating service at: ${SERVICES_API_URL}`, serviceData);
    
    const response = await fetch(SERVICES_API_URL, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify(serviceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to create service" }));
      throw new Error(errorData.detail || "Failed to create service");
    }
    
    const data = await response.json();
    return parseServiceFromAPI(data);
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

// Update an existing service
export const updateService = async (id: string, serviceData: Partial<Service>): Promise<Service> => {
  try {
    console.log(`Updating service at: ${SERVICES_API_URL}${id}/`, serviceData);
    
    const response = await fetch(`${SERVICES_API_URL}${id}/`, {
      method: "PUT",
      credentials: 'include',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify(serviceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to update service" }));
      throw new Error(errorData.detail || "Failed to update service");
    }
    
    const data = await response.json();
    return parseServiceFromAPI(data);
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

// Delete a service
export const deleteService = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting service at: ${SERVICES_API_URL}${id}/`);
    
    const response = await fetch(`${SERVICES_API_URL}${id}/`, {
      method: "DELETE",
      credentials: 'include',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
      },
    });
    
    if (!response.ok && response.status !== 204) { // 204 No Content is a success
      const errorData = await response.json().catch(() => ({ detail: "Failed to delete service" }));
      throw new Error(errorData.detail || "Failed to delete service");
    }
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};
