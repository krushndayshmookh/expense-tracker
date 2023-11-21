<template>
  <q-page class="q-pa-md">
    <q-card>
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
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

import { useAuthStore } from "src/stores/auth";
import { useGeneralStore } from "src/stores/general";

import { api } from "boot/axios";

export default defineComponent({
  name: "SettingsPage",

  setup() {
    const generalStore = useGeneralStore();
    generalStore.show_add_record = false;
    generalStore.title = "Settings";

    const $q = useQuasar();

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
          await api.post("/delete-user", {
            user_id: authStore.user.id,
          });

          await authStore.sign_out();
          router.push("/auth");

          $q.notify({
            type: "positive",
            message: "Account deleted successfully.",
          });
        } catch (error) {
          console.log(error);
        } finally {
          $q.loading.hide();
        }
      });
    };

    return {
      deleteAccount,
    };
  },
});
</script>
