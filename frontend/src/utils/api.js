// src/utils/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const url = API_BASE.replace(/\/$/, "") + path;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg = (data && data.message) || data || res.statusText || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    console.error("[API] Fetch error:", err);
    if (err instanceof TypeError) {
      throw new Error("Network error: Could not connect to server. Periksa backend berjalan di " + API_BASE);
    }
    throw err;
  }
}

// HTTP method helpers
const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export const auth = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  googleUrl: () => `${API_BASE}/auth/google`,
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
};

export const businessAPI = {
  create: (businessData) => api.post('/business', businessData),
  getMyBusiness: () => api.get('/business/my-business'),
  update: (id, businessData) => api.put(`/business/${id}`, businessData),
  delete: (id) => api.delete(`/business/${id}`),
  getAll: () => api.get('/business'),
  getDetail: (id) => api.get(`/business/${id}`),
};

export const productAPI = {
  create: (productData) => api.post('/products', productData),
  getByBusiness: (businessId) => api.get(`/products/business/${businessId}`),
  getAll: () => api.get('/products'),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getDetail: (id) => api.get(`/products/${id}`),
};

export const mealplanAPI = {
  getRecommendations: (data) => api.post('/mealplan/recommendations', data),
};

export default api;