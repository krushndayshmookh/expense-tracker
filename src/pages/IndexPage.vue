<template>
  <q-page>
    <q-list>
      <q-item clickable @click="edit_sheet(null)">
        <q-item-section side>
          <q-icon name="add_circle" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-primary text-weight-medium">
            Create New Sheet
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator></q-separator>

      <q-item-label header>Your Record Sheets</q-item-label>

      <q-item
        v-for="record_sheet in record_sheets"
        :key="record_sheet.id"
        clickable
        :to="`/sheets/${record_sheet.id}`"
      >
        <q-menu touch-position context-menu>
          <q-list style="min-width: 120px">
            <q-item clickable v-close-popup @click="edit_sheet(record_sheet)">
              <q-item-section side>
                <q-icon name="edit" size="16px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Edit</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="delete_sheet(record_sheet)">
              <q-item-section side>
                <q-icon name="delete" color="negative" size="16px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Delete</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
        <q-item-section>
          <q-item-label>{{ record_sheet.name }}</q-item-label>
          <q-item-label caption>{{
            $filters.shortDate(record_sheet.created_at)
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, computed } from "vue";

import { useQuasar, date, is } from "quasar";

import { supabase } from "src/boot/supabase";

import { useAuthStore } from "src/stores/auth";
import { useRecordStore } from "src/stores/record";
import { useGeneralStore } from "src/stores/general";

export default defineComponent({
  name: "IndexPage",

  setup() {
    const record_sheets = computed(() => recordStore.record_sheets);

    const $q = useQuasar();

    const authStore = useAuthStore();
    const recordStore = useRecordStore();
    const generalStore = useGeneralStore();

    generalStore.show_add_record = true;
    generalStore.title = "Expense Tracker";

    const create_default_sheet = async () => {
      const timeStamp = Date.now();
      const sheet_name = date.formatDate(timeStamp, "YYYY MMMM");

      $q.loading.show();

      const { data, error } = await supabase
        .from("record_sheets")
        .insert([
          { user_id: authStore.user.id, name: sheet_name, is_active: true },
        ])
        .single();
      if (error) {
        $q.notify({ type: "negative", message: error.message });
        console.error(JSON.stringify(error));
      } else {
        $q.notify({
          type: "positive",
          message: `Created sheet "${sheet_name}" successfully!`,
        });

        await fetch_sheets();
      }
    };

    const fetch_sheets = async () => {
      $q.loading.show();

      const { data, error } = await supabase
        .from("record_sheets")
        .select("*")
        .eq("user_id", authStore.user.id)
        .order("created_at", { ascending: false });
      if (error) {
        $q.notify({ type: "negative", message: error.message });
        console.error(JSON.stringify(error));
      } else {
        recordStore.record_sheets = data;
      }
      $q.loading.hide();
    };

    const fetch_categories = async () => {
      const { data, error } = await supabase
        .from("transaction_categories")
        .select("*")
        .or(`user_id.eq.${authStore.user.id},user_id.is.null`);

      if (error) {
        $q.notify({
          message: "Error fetching categories",
          type: "negative",
        });
        return;
      }

      recordStore.transaction_categories = data;
      recordStore.transaction_categories_name_map = data.reduce((acc, cur) => {
        acc[cur.id] = cur.label;
        return acc;
      }, {});
    };

    onMounted(async () => {
      if (!authStore.user) {
        return;
      }

      await fetch_sheets();

      if (!record_sheets.value.length) {
        await create_default_sheet();
      }

      if (!recordStore.transaction_categories.length) {
        await fetch_categories();
      }
    });

    const delete_sheet = async (record_sheet) => {
      $q.dialog({
        title: "Confirm Delete",
        message: "Are you sure you want to delete this record sheet?",
        cancel: true,
        ok: "Delete",
      }).onOk(async () => {
        const { data, error } = await supabase
          .from("record_sheets")
          .delete()
          .eq("id", record_sheet.id);
        if (error) {
          $q.notify({
            message: "Error deleting record sheet",
            type: "negative",
          });
          return;
        }

        $q.notify({
          message: "Deleted record sheet successfully",
          type: "positive",
        });
        await fetch_sheets();
      });
    };

    const edit_sheet = async (record_sheet) => {
      let is_new_sheet = false;

      if (!record_sheet) {
        is_new_sheet = true;
      }

      $q.dialog({
        title: "Sheet Name",
        message: "Enter a new name for this sheet",
        prompt: {
          model: is_new_sheet ? "" : record_sheet.name,
          type: "text",
        },
        cancel: true,
        persistent: true,
      }).onOk(async (name) => {
        name = name.trim();
        if (!name) {
          $q.notify({
            message: "Sheet name cannot be empty",
            type: "negative",
          });
          return;
        }

        if (is_new_sheet) {
          const { data, error } = await supabase
            .from("record_sheets")
            .insert([{ user_id: authStore.user.id, name, is_active: true }])
            .single();
          if (error) {
            $q.notify({
              message: "Error creating record sheet",
              type: "negative",
            });
            return;
          }

          $q.notify({
            message: "Created record sheet successfully",
            type: "positive",
          });
        } else {
          const { data, error } = await supabase
            .from("record_sheets")
            .update({ name })
            .eq("id", record_sheet.id);
          if (error) {
            $q.notify({
              message: "Error updating record sheet",
              type: "negative",
            });
            return;
          }

          $q.notify({
            message: "Updated record sheet successfully",
            type: "positive",
          });
        }
        await fetch_sheets();
      });
    };

    return {
      record_sheets,

      delete_sheet,
      edit_sheet,
    };
  },
});
</script>
