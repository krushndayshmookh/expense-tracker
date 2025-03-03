import { defineStore } from "pinia";

import { Notify } from "quasar";

import { recordService } from "src/services/recordService";

import { useAuthStore } from "./auth";

export const useRecordStore = defineStore("record", {
  persist: {
    key: "expense-tracker-records",
    storage: localStorage,
  },

  state: () => ({
    record_sheets: [],
    transaction_categories: [],
    transaction_categories_name_map: {},
    selected_record_sheet_id: null,
    selected_sheet_records: [],
    system_categories: [],
  }),

  getters: {
    active_record_sheet() {
      return this.record_sheets.find(
        (sheet) => sheet._id === this.selected_record_sheet_id
      );
    },

    get_name_for_sheet_id() {
      return (id) => {
        const sheets = this.record_sheets.filter((sheet) => sheet._id === id);
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
        return categories[0]._id;
      };
    },

    categoryKVList() {
      return this.transaction_categories.map((category) => {
        return {
          value: category._id,
          label: category.label,
          isSystemCategory: category.user_id === null,
        };
      });
    },

    recordSheetKVList() {
      return this.record_sheets.map((sheet) => {
        return {
          value: sheet._id,
          label: sheet.name,
        };
      });
    },

    sheet_datewise_expenses() {
      const datewise_expenses = {};

      this.selected_sheet_records.forEach((record) => {
        if (record.transaction_type === "expense") {
          const date = new Date(record.created_at)
            .toLocaleString()
            .split(",")[0]
            .trim();
          if (datewise_expenses[date]) {
            datewise_expenses[date] += record.amount;
          } else {
            datewise_expenses[date] = record.amount;
          }
        }
      });

      // convert to array of form [[date, expense], ...]

      const MS_IN_5_30_HOURS = 5.5 * 60 * 60 * 1000;

      const datewise_expenses_array = Object.entries(datewise_expenses).map(
        ([date, expense]) => {
          return [new Date(date).valueOf() + MS_IN_5_30_HOURS, expense / 100];
        }
      );

      return datewise_expenses_array;
    },
  },

  actions: {
    clear_data() {
      this.record_sheets = [];
      this.transaction_categories = [];
      this.transaction_categories_name_map = {};
      this.selected_record_sheet_id = null;
      this.selected_sheet_records = [];
    },

    async fetch_record_sheets() {
      try {
        const data = await recordService.getRecordSheets();
        this.record_sheets = data;

        // If no record sheet is selected but we have sheets, select the first one
        if (!this.selected_record_sheet_id && this.record_sheets.length > 0) {
          this.selected_record_sheet_id = this.record_sheets[0]._id;
        }
      } catch (error) {
        Notify.create({
          message: "Error fetching record sheets",
          type: "negative",
        });
      }
    },

    async fetch_records() {
      try {
        if (!this.selected_record_sheet_id) return;

        const data = await recordService.getTransactions(
          this.selected_record_sheet_id
        );
        this.selected_sheet_records = data;
      } catch (error) {
        Notify.create({
          message: "Error fetching records",
          type: "negative",
        });
      }
    },

    async fetch_categories() {
      try {
        const data = await recordService.getCategories();
        this.transaction_categories = data;
        this.transaction_categories_name_map = data.reduce((acc, cur) => {
          acc[cur._id] = cur.label;
          return acc;
        }, {});
        // Create a mapping for system categories
        this.system_categories = data
          .filter((cat) => cat.user_id === null)
          .map((cat) => cat._id);
      } catch (error) {
        Notify.create({
          message: "Error fetching categories",
          type: "negative",
        });
      }
    },

    async create_record_sheet(name, description = "") {
      try {
        const data = await recordService.createRecordSheet(name, description);
        this.record_sheets.push(data);
        this.selected_record_sheet_id = data._id;
        return data;
      } catch (error) {
        Notify.create({
          message: "Error creating record sheet",
          type: "negative",
        });
        return null;
      }
    },

    async update_record_sheet(id, name, description = "") {
      try {
        const data = await recordService.updateRecordSheet(
          id,
          name,
          description
        );
        const index = this.record_sheets.findIndex((sheet) => sheet._id === id);
        if (index !== -1) {
          this.record_sheets[index] = data;
        }
        return data;
      } catch (error) {
        Notify.create({
          message: "Error updating record sheet",
          type: "negative",
        });
        return null;
      }
    },

    async delete_record_sheet(id) {
      try {
        await recordService.deleteRecordSheet(id);
        this.record_sheets = this.record_sheets.filter(
          (sheet) => sheet._id !== id
        );

        // If the deleted sheet was selected, select another one or set to null
        if (this.selected_record_sheet_id === id) {
          this.selected_record_sheet_id =
            this.record_sheets.length > 0 ? this.record_sheets[0]._id : null;
          this.selected_sheet_records = [];
        }

        return true;
      } catch (error) {
        Notify.create({
          message: "Error deleting record sheet",
          type: "negative",
        });
        return false;
      }
    },

    async create_transaction(transaction) {
      try {
        const data = await recordService.createTransaction(transaction);
        if (transaction.record_sheet_id === this.selected_record_sheet_id) {
          this.selected_sheet_records.unshift(data);
        }
        return data;
      } catch (error) {
        Notify.create({
          message: "Error creating transaction",
          type: "negative",
        });
        return null;
      }
    },

    async update_transaction(id, transaction) {
      try {
        const data = await recordService.updateTransaction(id, transaction);

        // If the transaction changed record_sheet_id and it's no longer in the selected sheet
        if (data.record_sheet_id !== this.selected_record_sheet_id) {
          this.selected_sheet_records = this.selected_sheet_records.filter(
            (r) => r._id !== id
          );
        } else {
          // Update the transaction in the current view
          const index = this.selected_sheet_records.findIndex(
            (r) => r._id === id
          );
          if (index !== -1) {
            this.selected_sheet_records.splice(index, 1, data);
          } else {
            // This was moved to the current view from another sheet
            this.selected_sheet_records.unshift(data);
          }
        }

        return data;
      } catch (error) {
        Notify.create({
          message: "Error updating transaction",
          type: "negative",
        });
        return null;
      }
    },

    async delete_transaction(id) {
      try {
        await recordService.deleteTransaction(id);
        const index = this.selected_sheet_records.findIndex(
          (r) => r._id === id
        );
        if (index !== -1) {
          this.selected_sheet_records.splice(index, 1);
        }
        return true;
      } catch (error) {
        Notify.create({
          message: "Error deleting transaction",
          type: "negative",
        });
        return false;
      }
    },

    async create_category(label) {
      try {
        const data = await recordService.createCategory(label);
        this.transaction_categories.push(data);
        this.transaction_categories_name_map[data._id] = data.label;
        return data;
      } catch (error) {
        Notify.create({
          message: "Error creating category",
          type: "negative",
        });
        return null;
      }
    },

    async update_category(id, label) {
      try {
        const data = await recordService.updateCategory(id, label);
        const index = this.transaction_categories.findIndex(
          (cat) => cat._id === id
        );
        if (index !== -1) {
          this.transaction_categories[index] = data;
        }
        this.transaction_categories_name_map[id] = label;
        return data;
      } catch (error) {
        Notify.create({
          message: "Error updating category",
          type: "negative",
        });
        return null;
      }
    },

    async delete_category(id) {
      try {
        // Check if it's a system category
        if (this.system_categories && this.system_categories.includes(id)) {
          Notify.create({
            message: "System categories cannot be deleted",
            type: "negative",
          });
          return false;
        }

        await recordService.deleteCategory(id);
        this.transaction_categories = this.transaction_categories.filter(
          (cat) => cat._id !== id
        );
        delete this.transaction_categories_name_map[id];
        return true;
      } catch (error) {
        Notify.create({
          message: error.response?.data?.message || "Error deleting category",
          type: "negative",
        });
        return false;
      }
    },

    // Helper methods to maintain backward compatibility
    addRecord(record) {
      if (record.record_sheet_id !== this.selected_record_sheet_id) {
        return;
      }
      this.selected_sheet_records.unshift(record);
    },

    updateRecord(record) {
      if (record.record_sheet_id !== this.selected_record_sheet_id) {
        this.selected_sheet_records = this.selected_sheet_records.filter(
          (r) => r._id !== record._id
        );
        return;
      }

      const index = this.selected_sheet_records.findIndex(
        (r) => r._id === record._id
      );
      if (index !== -1) {
        this.selected_sheet_records.splice(index, 1, record);
      }
    },

    deleteRecord(record_id) {
      const index = this.selected_sheet_records.findIndex(
        (r) => r._id === record_id
      );
      if (index !== -1) {
        this.selected_sheet_records.splice(index, 1);
      }
    },

    selectRecordSheet(id) {
      this.selected_record_sheet_id = id;
      this.selected_sheet_records = [];
      this.fetch_records();
    },
  },
});
