const API_BASE_URL = "https://waselp.com/api";

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const apiFetch = async (endpoint, options = {}) => {
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
    const response = await apiFetch(`/profile/update/${userId}`, {
      method: "PUT",
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
      },
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
      },
    );
    return response;
  },
};

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
      },
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

  markConversationNotificationsRead: async (workRequestId, senderId) => {
    const response = await apiFetch(
      `/chat/mark-notifications-read/${workRequestId}/${senderId}`,
      {
        method: "POST",
      },
    );
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

export const adminAPI = {
  getStats: async () => {
    return await apiFetch("/admin/stats");
  },

  getRequests: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`/admin/requests?${queryString}`);
  },

  updateRequestStatus: async (id, statusData) => {
    return await apiFetch(`/admin/requests/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },

  updateRequest: async (id, data) => {
    return await apiFetch(`/admin/requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getUsers: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`/admin/users?${queryString}`);
  },

  deleteUser: async (id) => {
    return await apiFetch(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },

  sendNotification: async (data) => {
    return await apiFetch("/admin/users/notify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id, data) => {
    return await apiFetch(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getSupportChats: async () => {
    return await apiFetch("/admin/support/chats");
  },

  getActiveChats: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`/admin/chats/active?${queryString}`);
  },

  getChatMessages: async (workRequestId) => {
    return await apiFetch(`/admin/chats/${workRequestId}`);
  },
};

export const supportAPI = {
  initiateChat: async () => {
    return await apiFetch("/support/chat/initiate", {
      method: "POST",
    });
  },
};
