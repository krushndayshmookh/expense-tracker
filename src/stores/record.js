import { defineStore } from "pinia";

import { Notify } from "quasar";

import { supabase } from "src/boot/supabase";

import { useAuthStore } from "./auth";

export const useRecordStore = defineStore("record", {
  persist: true,

  state: () => ({
    record_sheets: [],
    transaction_categories: [],
    transaction_categories_name_map: {},
    selected_record_sheet_id: null,
    selected_sheet_records: [],
  }),

  getters: {
    active_record_sheet() {
      return this.record_sheets.find(
        (sheet) => sheet.id === this.selected_record_sheet_id
      );
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
    },

    async fetch_records() {
      const { data, error } = await supabase
        .from("transaction_records")
        .select("*")
        .eq("record_sheet_id", this.selected_record_sheet_id)
        .order("created_at", { ascending: false });
      if (error) {
        Notify.create({
          message: "Error fetching records",
          type: "negative",
        });
        return;
      }

      this.selected_sheet_records = data;
    },

    async fetch_categories() {
      const authStore = useAuthStore();

      const { data, error } = await supabase
        .from("transaction_categories")
        .select("*")
        .or(`user_id.eq.${authStore.user.id},user_id.is.null`)
        .order("label", { ascending: true });

      if (error) {
        Notify.create({
          message: "Error fetching categories",
          type: "negative",
        });
        return;
      }

      this.transaction_categories = data;
      this.transaction_categories_name_map = data.reduce((acc, cur) => {
        acc[cur.id] = cur.label;
        return acc;
      }, {});
    },

    addRecord(record) {
      if (record.record_sheet_id !== this.selected_record_sheet_id) {
        return;
      }

      this.selected_sheet_records.unshift(record);
    },

    updateRecord(record) {
      if (record.record_sheet_id !== this.selected_record_sheet_id) {
        this.selected_sheet_records = this.selected_sheet_records.filter(
          (r) => r.id !== record.id
        );
      }

      const index = this.selected_sheet_records.findIndex(
        (r) => r.id === record.id
      );
      this.selected_sheet_records.splice(index, 1, record);
    },

    deleteRecord(record_id) {
      const index = this.selected_sheet_records.findIndex(
        (r) => r.id === record_id
      );
      if (index !== -1) {
        this.selected_sheet_records.splice(index, 1);
      }
    },
  },
});
