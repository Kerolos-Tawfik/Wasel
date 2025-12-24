const API_BASE_URL = "http://localhost:8000/api";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Base fetch wrapper with authentication
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  return response;
};

/**
 * Authentication API calls
 */
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(userData),
    });
    return response;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(credentials),
    });
    return response;
  },

  logout: async () => {
    const response = await apiFetch("/logout", {
      method: "POST",
    });
    return response;
  },

  getCurrentUser: async () => {
    const response = await apiFetch("/user/current");
    return response;
  },
};

/**
 * Profile API calls
 */
export const profileAPI = {
  getProfile: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
    return response;
  },

  updateProfile: async (userId, profileData) => {
    const response = await fetch(`${API_BASE_URL}/profile/update/${userId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(profileData),
    });
    return response;
  },

  upsertProfile: async (profileData) => {
    const response = await apiFetch("/profile/upsert", {
      method: "POST",
      body: JSON.stringify(profileData),
    });
    return response;
  },

  switchRole: async (userId, newRole) => {
    const response = await fetch(`${API_BASE_URL}/profile/update-role/${userId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ user_role: newRole }),
    });
    return response;
  },

  uploadAvatar: async (userId, formData) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/profile/upload-avatar/${userId}`, {
      method: "POST",
      headers: {
        ...headers,
        "Accept": "application/json"
      },
      body: formData,
    });
    return response;
  },
};

/**
 * Portfolio API calls
 */
export const portfolioAPI = {
  getPortfolio: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/portfolio/${userId}`);
    return response;
  },

  addPortfolioItem: async (portfolioData) => {
    const response = await fetch(`${API_BASE_URL}/portfolio`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(portfolioData),
    });
    return response;
  },

  deletePortfolioItem: async (userId, itemId) => {
    const response = await fetch(`${API_BASE_URL}/portfolio/${userId}/${itemId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    });
    return response;
  },
};

/**
 * Work Request API calls
 */
export const workRequestAPI = {
  getAllWorkRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/work-requests`);
    return response;
  },

  createWorkRequest: async (workRequestData) => {
    const response = await fetch(`${API_BASE_URL}/work-request`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(workRequestData),
    });
    return response;
  },
};
