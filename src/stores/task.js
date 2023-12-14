import { defineStore } from "pinia";

import { Notify } from "quasar";

import { api } from "boot/axios";
import { supabase } from "src/boot/supabase";

import { useAuthStore } from "./auth";

export const useTaskStore = defineStore("task", {
  persist: true,

  state: () => ({
    tasks: [],
    tasklist_id: null,
    selected_task: null,
    tasklist_users: [],
    channel: null,
  }),

  getters: {},

  actions: {
    clear_data() {
      this.tasks = [];
      this.tasklist_id = null;
      this.selected_task = null;
    },

    async fetch_tasklists() {
      const { data: taslklist_users, error: tasklist_users_error } =
        await supabase
          .from("tasklist_users")
          .select("*")
          .eq("user_id", useAuthStore().user.id);

      if (tasklist_users_error) {
        Notify.create({
          message: "Error fetching tasklists",
          type: "negative",
        });
        return;
      }

      if (taslklist_users.length == 0) {
        this.create_new_tasklist();
        return;
      }

      this.tasklist_id = taslklist_users[0].tasklist_id;

      await this.fetch_tasklist_shares();
    },

    async fetch_tasklist_shares() {
      const { data: tasklist_users, error: tasklist_users_error } =
        await supabase
          .from("tasklist_users")
          .select("*")
          .eq("tasklist_id", this.tasklist_id);

      if (tasklist_users_error) {
        Notify.create({
          message: "Error fetching tasklist shares",
          type: "negative",
        });
        return;
      }

      this.tasklist_users = tasklist_users;
    },

    async create_new_tasklist() {
      const { data, error } = await supabase
        .from("tasklists")
        .insert([{ title: "My Tasklist" }])
        .select();

      if (error) {
        Notify.create({
          message: "Error creating tasklist",
          type: "negative",
        });
        return;
      }

      const { data: tasklist_users, error: tasklist_users_error } =
        await supabase
          .from("tasklist_users")
          .insert([
            {
              tasklist_id: data[0].id,
              user_id: useAuthStore().user.id,
            },
          ])
          .select();

      if (tasklist_users_error) {
        Notify.create({
          message: "Error creating tasklist user",
          type: "negative",
        });
        return;
      }

      this.tasklist_id = data[0].id;
      this.tasklist_users = tasklist_users;
    },

    async fetch_tasks() {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("tasklist_id", this.tasklist_id)
        .order("created_at", { ascending: false });

      if (error) {
        Notify.create({
          message: "Error fetching tasks",
          type: "negative",
        });
        return;
      }

      this.tasks = data;
    },

    async create_task(task) {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            ...task,
            tasklist_id: this.tasklist_id,
            owner_id: useAuthStore().user.id,
            creator_id: useAuthStore().user.id,
          },
        ])
        .select();

      if (error) {
        Notify.create({
          message: "Error creating task",
          type: "negative",
        });
        return;
      }

      this.tasks.unshift(data[0]);
    },

    async update_task(task) {
      const { data, error } = await supabase
        .from("tasks")
        .update(task)
        .eq("id", task.id)
        .select();

      if (error) {
        Notify.create({
          message: "Error updating task",
          type: "negative",
        });
        return;
      }

      const index = this.tasks.findIndex((t) => t.id == task.id);
      this.tasks[index] = data[0];
    },

    async delete_task(task) {
      const { data, error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", task.id)
        .select();

      if (error) {
        Notify.create({
          message: "Error deleting task",
          type: "negative",
        });
        return;
      }

      this.tasks = this.tasks.filter((t) => t.id != task.id);
    },

    async share_tasklist(email) {
      try {
        await api.post("/tasklist-share", {
          tasklist_id: this.tasklist_id,
          email,
        });

        Notify.create({
          message: "Tasklist shared",
          type: "positive",
        });

        await this.fetch_tasklist_shares();
      } catch (error) {
        Notify.create({
          message: "Error sharing tasklist",
          type: "negative",
        });
      }
    },

    async subscribe_to_tasklist_updates() {
      try {
        this.channel = await supabase
          .channel("tasklist_updates")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "tasks",
              filter: `tasklist_id=eq.${this.tasklist_id}`,
            },
            (payload) => {
              if (payload.new.creator_id == useAuthStore().user.id) {
                return;
              }
              this.tasks.unshift(payload.new);
            }
          )
          .subscribe();
      } catch (error) {
        Notify.create({
          message: "Error subscribing to tasklist updates",
          type: "negative",
        });
      }
    },

    async unsubscribe_from_tasklist_updates() {
      try {
        await supabase.removeChannel(this.channel);
      } catch (error) {
        Notify.create({
          message: "Error unsubscribing from tasklist updates",
          type: "negative",
        });
      }
    },
  },
});
