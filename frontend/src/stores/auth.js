import { defineStore } from "pinia";
import { Notify } from "quasar";
import { authService } from "src/services/authService";
import { useRecordStore } from "./record";

export const useAuthStore = defineStore("auth", {
  persist: {
    key: "expense-tracker-auth",
    storage: localStorage,
    paths: ["user", "token"],
  },

  state: () => ({
    user: null,
    token: null,
  }),

  getters: {
    isAuthenticated() {
      return !!this.token;
    },
  },

  actions: {
    async check_sign_in() {
      try {
        // Get token from localStorage (single source of truth)
        const token = localStorage.getItem("jwt_token");

        if (!token) {
          // No token in localStorage, but there might be one in the store
          // due to persistence. Clear it to ensure consistency.
          if (this.token) {
            this.token = null;
            this.user = null;
          }
          return false;
        }

        // Set the token in the store (even if it's already there, for consistency)
        this.token = token;

        try {
          // Get user profile to verify token validity
          const response = await authService.getProfile();

          // Check if the response has the expected structure
          if (!response || !response.data || !response.data.user) {
            console.error(
              "Invalid response structure from getProfile:",
              response
            );
            this.token = null;
            this.user = null;
            localStorage.removeItem("jwt_token");
            return false;
          }

          this.user = response.data.user;
          return true;
        } catch (error) {
          // Token is invalid
          console.error("Invalid token:", error);
          this.token = null;
          this.user = null;
          localStorage.removeItem("jwt_token");
          return false;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        this.token = null;
        this.user = null;
        localStorage.removeItem("jwt_token");
        return false;
      }
    },

    async sign_in(email, password) {
      try {
        const data = await authService.login(email, password);

        if (!data || !data.user || !data.token) {
          throw new Error("Invalid response from server");
        }

        this.user = data.user;
        this.token = data.token;
        // localStorage.setItem is now handled in authService.login
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        this.token = null;
        this.user = null;
        Notify.create({
          type: "negative",
          message: error.response?.data?.message || "Error signing in",
        });
        return false;
      }
    },

    async sign_up(email, password) {
      try {
        const data = await authService.register(email, password);

        if (!data || !data.user || !data.token) {
          throw new Error("Invalid response from server");
        }

        this.user = data.user;
        this.token = data.token;
        // localStorage.setItem is now handled in authService.register
        return true;
      } catch (error) {
        console.error("Sign up error:", error);
        this.token = null;
        this.user = null;
        Notify.create({
          type: "negative",
          message: error.response?.data?.message || "Error signing up",
        });
        return false;
      }
    },

    async sign_out() {
      try {
        await authService.logout();
        this.user = null;
        this.token = null;
        useRecordStore().clear_data();
        return true;
      } catch (error) {
        Notify.create({
          type: "negative",
          message: "Error signing out",
        });
        return false;
      }
    },
  },
});
