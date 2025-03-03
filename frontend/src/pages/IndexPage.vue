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
        :key="record_sheet._id"
        clickable
        :to="`/sheets/${record_sheet._id}`"
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

      <q-separator></q-separator>
      <q-item>
        <q-item-section side>
          <q-icon name="info" size="16px"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Long-press items for more options.
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, computed } from "vue";
import { useQuasar, date } from "quasar";

import { useAuthStore } from "src/stores/auth";
import { useRecordStore } from "src/stores/record";
import { useGeneralStore } from "src/stores/general";
import { recordService } from "src/services/recordService";

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

      try {
        await recordStore.create_record_sheet(sheet_name);

        $q.notify({
          type: "positive",
          message: `Created sheet "${sheet_name}" successfully!`,
        });
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || "Error creating sheet",
        });
        console.error(error);
      } finally {
        $q.loading.hide();
      }
    };

    onMounted(async () => {
      if (!authStore.user) {
        return;
      }

      await recordStore.fetch_record_sheets();

      if (!record_sheets.value.length) {
        await create_default_sheet();
      }

      if (!recordStore.transaction_categories.length) {
        await recordStore.fetch_categories();
      }
    });

    const delete_sheet = async (record_sheet) => {
      $q.dialog({
        title: "Confirm Delete",
        message: "Are you sure you want to delete this record sheet?",
        cancel: true,
        ok: {
          label: "Delete",
          color: "negative",
        },
      }).onOk(async () => {
        try {
          await recordStore.delete_record_sheet(record_sheet._id);

          $q.notify({
            message: "Deleted record sheet successfully",
            type: "positive",
          });
        } catch (error) {
          $q.notify({
            message:
              error.response?.data?.message || "Error deleting record sheet",
            type: "negative",
          });
        }
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
        ok: {
          label: "Save",
          color: "primary",
        },
      }).onOk(async (name) => {
        name = name.trim();
        if (!name) {
          $q.notify({
            message: "Sheet name cannot be empty",
            type: "negative",
          });
          return;
        }

        try {
          if (is_new_sheet) {
            await recordStore.create_record_sheet(name);

            $q.notify({
              message: "Created record sheet successfully",
              type: "positive",
            });
          } else {
            await recordStore.update_record_sheet(
              record_sheet._id,
              name,
              record_sheet.description || ""
            );

            $q.notify({
              message: "Updated record sheet successfully",
              type: "positive",
            });
          }
        } catch (error) {
          $q.notify({
            message:
              error.response?.data?.message ||
              (is_new_sheet
                ? "Error creating record sheet"
                : "Error updating record sheet"),
            type: "negative",
          });
        }
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
