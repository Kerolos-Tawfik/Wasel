const BASE_URL = "http://localhost:8000/api/admin";

const getHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const adminAPI = {
  // Stats
  getStats: async () => {
    return fetch(`${BASE_URL}/stats`, {
      method: "GET",
      headers: getHeaders(),
    });
  },

  // Requests
  getRequests: async (page = 1, filters = {}) => {
    const queryParams = new URLSearchParams({ page, ...filters }).toString();
    return fetch(`${BASE_URL}/requests?${queryParams}`, {
      method: "GET",
      headers: getHeaders(),
    });
  },

  updateRequestStatus: async (id, status) => {
    return fetch(`${BASE_URL}/requests/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
  },

  updateRequest: async (id, data) => {
    return fetch(`${BASE_URL}/requests/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },
};
