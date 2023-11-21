import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  persist: true,

  state: () => ({
    show_add_record: false,
    title: "Expense Tracker",
  }),

  actions: {},
});
