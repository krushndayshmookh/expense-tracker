import { boot } from "quasar/wrappers";
import axios from "axios";

// Create API instance with base URL pointing to our new Express backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api", // Update with your backend URL
});

// Add an interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Clear Authorization header if no token exists
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, clear the token
      localStorage.removeItem("jwt_token");
    }
    return Promise.reject(error);
  }
);

export { api };

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});
