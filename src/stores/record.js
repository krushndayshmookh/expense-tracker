import { defineStore } from "pinia";

export const useRecordStore = defineStore("record", {
  persist: true,

  state: () => ({
    record_sheets: [],
    transaction_categories: [],
    transaction_categories_name_map: {},
  }),

  getters: {
    active_record_sheet() {
      return this.record_sheets.find((sheet) => sheet.is_active);
    },

    get_name_for_sheet_id() {
      return (id) => {
        const sheets = this.record_sheets.filter((sheet) => sheet.id === id);
        if (sheets.length === 0) {
          return null;
        }
        return sheets[0].name;
      };
    },

    get_id_for_label() {
      return (label) => {
        const categories = this.transaction_categories.filter(
          (category) => category.label === label
        );
        if (categories.length === 0) {
          return null;
        }
        return categories[0].id;
      };
    },

    categoryKVList() {
      return this.transaction_categories.map((category) => {
        return {
          value: category.id,
          label: category.label,
        };
      });
    },

    recordSheetKVList() {
      return this.record_sheets.map((sheet) => {
        return {
          value: sheet.id,
          label: sheet.name,
        };
      });
    },
  },

  actions: {
    clear_data() {
      this.record_sheets = [];
      this.transaction_categories = [];
      this.transaction_categories_name_map = {};
    },
  },
});
