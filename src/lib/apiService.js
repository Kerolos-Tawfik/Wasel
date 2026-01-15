<<<<<<< HEAD
const API_BASE_URL = "https://waselp.com/api";
=======
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
>>>>>>> f6b337d1edad2c855d6357286650f980cbaea225

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
    Accept: "application/json",
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
        Accept: "application/json",
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
        Accept: "application/json",
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
        Accept: "application/json",
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
    const response = await fetch(
      `${API_BASE_URL}/profile/update-role/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ user_role: newRole }),
      }
    );
    return response;
  },

  uploadAvatar: async (userId, formData) => {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/profile/upload-avatar/${userId}`,
      {
        method: "POST",
        headers: {
          ...headers,
          Accept: "application/json",
        },
        body: formData,
      }
    );
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
        Accept: "application/json",
      },
      body: JSON.stringify(portfolioData),
    });
    return response;
  },

  deletePortfolioItem: async (userId, itemId) => {
    const response = await fetch(
      `${API_BASE_URL}/portfolio/${userId}/${itemId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response;
  },

  updatePortfolioItem: async (itemId, portfolioData) => {
    const response = await fetch(`${API_BASE_URL}/portfolio/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(portfolioData),
    });
    return response;
  },
};

export const categoriesAPI = {
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
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

  getWorkRequestById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/work-requests/${id}`);
    return response;
  },

  createWorkRequest: async (workRequestData) => {
    const token = getAuthToken();
    const headers = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const isFormData = workRequestData instanceof FormData;

    const response = await fetch(`${API_BASE_URL}/work-request`, {
      method: "POST",
      headers,
      body: isFormData ? workRequestData : JSON.stringify(workRequestData),
    });
    return response;
  },

  getMyRequests: async () => {
    const response = await apiFetch("/work-requests/my");
    return response;
  },
};

export const workStatusAPI = {
  updateStatus: async (id, statusData) => {
    const response = await apiFetch(`/work-request/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
    return response;
  },

  assignProvider: async (id, providerData) => {
    const response = await apiFetch(`/work-request/${id}/assign-provider`, {
      method: "PUT",
      body: JSON.stringify(providerData),
    });
    return response;
  },

  getMyRequests: async () => {
    const response = await apiFetch("/work-requests/my");
    return response;
  },
};

export const reviewAPI = {
  submitReview: async (reviewData) => {
    const response = await apiFetch("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
    return response;
  },

  updateReview: async (id, reviewData) => {
    const response = await apiFetch(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
    return response;
  },

  getUserReviews: async (userId) => {
    const response = await apiFetch(`/reviews/user/${userId}`);
    return response;
  },
};

export const chatAPI = {
  getConversations: async () => {
    const response = await apiFetch("/chat/conversations");
    return response;
  },

  getMessages: async (workRequestId, receiverId) => {
    let url = `/chat/${workRequestId}`;
    if (receiverId) {
      url += `?other_user_id=${receiverId}`;
    }
    const response = await apiFetch(url);
    return response;
  },

  sendMessage: async (messageData) => {
    const response = await apiFetch("/chat", {
      method: "POST",
      body: JSON.stringify(messageData),
    });
    return response;
  },
};

export const notificationAPI = {
  getNotifications: async () => {
    const response = await apiFetch("/notifications");
    return response;
  },
  markAsRead: async (id) => {
    const response = await apiFetch(`/notifications/${id}/read`, {
      method: "POST",
    });
    return response;
  },
  markAllAsRead: async () => {
    const response = await apiFetch("/notifications/read-all", {
      method: "POST",
    });
    return response;
  },
};
