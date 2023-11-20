import { defineStore } from "pinia";

import { supabase } from "src/boot/supabase";

import { Notify } from "quasar";

import { useRecordStore } from "./record";

export const useAuthStore = defineStore("auth", {
  persist: true,

  state: () => ({
    session: null,
    user: null,
  }),

  actions: {
    async check_sign_in() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        Notify.create({
          type: "negative",
          message: error.message,
        });
        return false;
      }

      if (!session) {
        return false;
      }

      this.session = session;
      this.user = session.user;
      return true;
    },

    async sign_out() {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Notify.create({
          type: "negative",
          message: error.message,
        });
        return false;
      }
      this.session = null;
      this.user = null;
      useRecordStore().clear_data();
      return true;
    },
  },
});
