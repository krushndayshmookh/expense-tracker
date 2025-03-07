<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-item-label header> Manage Custom Categories </q-item-label>
      <q-list bordered>
        <q-item clickable @click="create_category">
          <q-item-section side>
            <q-icon name="add_circle" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-primary text-weight-medium">
              Add Category
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-for="category in custom_categories"
          :key="category._id"
          clickable
        >
          <q-item-section @click="edit_category(category)">
            <q-item-label>{{ category.label }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              round
              flat
              icon="delete"
              color="negative"
              @click="delete_category(category)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-card class="q-mt-md">
      <q-item-label header> System Categories (Read-only) </q-item-label>
      <q-list bordered>
        <q-item v-for="category in system_categories" :key="category._id">
          <q-item-section>
            <q-item-label>{{ category.label }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="lock" color="grey" />
          </q-item-section>
        </q-item>
        <q-item v-if="system_categories.length === 0">
          <q-item-section>
            <q-item-label class="text-grey"
              >No system categories defined</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-card class="q-mt-md">
      <q-item-label header class="text-negative text-weight-medium">
        Delete Account
      </q-item-label>
      <q-item>
        <q-item-section>
          <q-item-label>
            Click the button below to delete your account and all the data
            associated with it. This action is irreversible. Please be careful.
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-btn
            color="negative"
            label="Delete Account"
            @click="deleteAccount"
          />
        </q-item-section>
      </q-item>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

import { useAuthStore } from "src/stores/auth";
import { useGeneralStore } from "src/stores/general";
import { useRecordStore } from "src/stores/record";
import { recordService } from "src/services/recordService";

import { api } from "boot/axios";

export default defineComponent({
  name: "SettingsPage",

  setup() {
    const generalStore = useGeneralStore();
    generalStore.show_add_record = false;
    generalStore.title = "Settings";

    const $q = useQuasar();

    const recordStore = useRecordStore();

    const custom_categories = ref([]);
    const system_categories = ref([]);

    const fetch_custom_categories = async () => {
      try {
        const response = await recordService.getCategories();
        custom_categories.value = response.filter(
          (cat) => cat.user_id !== null
        );
        system_categories.value = response.filter(
          (cat) => cat.user_id === null
        );
      } catch (error) {
        $q.notify({
          message: "Error fetching categories",
          type: "negative",
        });
      }
    };

    onMounted(() => {
      fetch_custom_categories();
    });

    onUnmounted(async () => {
      await recordStore.fetch_categories();
    });

    const delete_category = async (category) => {
      $q.dialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete ${category.label}?`,
        cancel: true,
        ok: {
          label: "Delete",
          color: "negative",
        },
      }).onOk(async () => {
        try {
          await recordService.deleteCategory(category._id);

          $q.notify({
            message: "Deleted category successfully",
            type: "positive",
          });

          fetch_custom_categories();
        } catch (error) {
          $q.notify({
            message: error.response?.data?.message || "Error deleting category",
            type: "negative",
          });
        }
      });
    };

    const edit_category = async (category) => {
      $q.dialog({
        title: "Edit Category",
        message: "Enter the new name for this category",
        prompt: {
          model: category.label,
          isValid: (val) => val.length > 0,
        },
        cancel: true,
        persistent: true,
        ok: {
          label: "Save",
          color: "primary",
        },
      }).onOk(async (label) => {
        try {
          await recordService.updateCategory(category._id, label);

          $q.notify({
            message: "Updated category successfully",
            type: "positive",
          });

          fetch_custom_categories();
        } catch (error) {
          $q.notify({
            message: error.response?.data?.message || "Error updating category",
            type: "negative",
          });
        }
      });
    };

    const create_category = async () => {
      $q.dialog({
        title: "New Category",
        message: "Enter the name for this category",
        prompt: {
          model: "",
          isValid: (val) => val.length > 0,
        },
        cancel: true,
        persistent: true,
        ok: {
          label: "Save",
          color: "primary",
        },
      }).onOk(async (label) => {
        try {
          await recordService.createCategory(label);

          $q.notify({
            message: "Created category successfully",
            type: "positive",
          });

          fetch_custom_categories();
        } catch (error) {
          $q.notify({
            message: error.response?.data?.message || "Error creating category",
            type: "negative",
          });
        }
      });
    };

    const authStore = useAuthStore();
    const router = useRouter();

    const deleteAccount = async () => {
      $q.dialog({
        title: "Confirm Delete",
        message: "Are you sure you want to delete your account?",
        cancel: true,
        ok: {
          label: "Delete",
          color: "negative",
        },
      }).onOk(async () => {
        try {
          $q.loading.show();
          await api.delete("/auth/delete-account");

          await authStore.sign_out();
          router.push("/auth");

          $q.notify({
            type: "positive",
            message: "Account deleted successfully.",
          });
        } catch (error) {
          console.log(error);
          $q.notify({
            type: "negative",
            message: error.response?.data?.message || "Error deleting account",
          });
        } finally {
          $q.loading.hide();
        }
      });
    };

    return {
      custom_categories,
      system_categories,
      delete_category,
      edit_category,
      create_category,

      deleteAccount,
    };
  },
});
</script>
