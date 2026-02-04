import { apiFetch } from "./apiService";

export const adminAPI = {
  getStats: async () => {
    const response = await apiFetch("/admin/stats");
    return response;
  },

  getRequests: async (page = 1, filters = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    const response = await apiFetch(
      `/admin/requests?${queryParams.toString()}`,
    );
    return response;
  },

  updateRequestStatus: async (id, status, rejectionReason = null) => {
    const body = { status };
    if (rejectionReason) {
      body.rejection_reason = rejectionReason;
    }
    const response = await apiFetch(`/admin/requests/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return response;
  },

  updateRequest: async (id, data) => {
    const response = await apiFetch(`/admin/requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },

  getUsers: async (page = 1, search = "") => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    if (search) queryParams.append("search", search);
    const response = await apiFetch(`/admin/users?${queryParams.toString()}`);
    return response;
  },

  deleteUser: async (id) => {
    const response = await apiFetch(`/admin/users/${id}`, {
      method: "DELETE",
    });
    return response;
  },

  sendNotification: async (data) => {
    const response = await apiFetch(`/admin/users/notify`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  getChatMessages: async (requestId) => {
    const response = await apiFetch(`/admin/chats/${requestId}`);
    return response;
  },

  updateUser: async (id, data) => {
    const response = await apiFetch(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },

  getSupportChats: async () => {
    const response = await apiFetch("/admin/support/chats");
    return response;
  },

  getActiveChats: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiFetch(`/admin/chats/active?${queryString}`);
    return response;
  },

  closeSupportTicket: async (id) => {
    const response = await apiFetch(`/admin/support/chats/${id}/close`, {
      method: "POST",
    });
    return response;
  },
};
