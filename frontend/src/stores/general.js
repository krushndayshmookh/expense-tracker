import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  persist: {
    key: "expense-tracker-general",
    storage: localStorage,
  },

  state: () => ({
    show_add_record: false,
    title: "Expense Tracker",
  }),

  actions: {},
});
