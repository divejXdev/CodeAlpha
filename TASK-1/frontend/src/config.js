// frontend/src/config.js

export const API_URL = "https://shopnest-backend-fp9w.onrender.com/api";

export const API = {
  REGISTER: `${API_URL}/auth/register`,
  LOGIN: `${API_URL}/auth/login`,

  PRODUCTS: `${API_URL}/products`,
  PRODUCT: (id) => `${API_URL}/products/${id}`,

  CART: `${API_URL}/cart`,

  ORDERS: `${API_URL}/orders`,
  ORDER: (id) => `${API_URL}/orders/${id}`,

  PROFILE: `${API_URL}/users/profile`,

  USERS: `${API_URL}/users`,
};