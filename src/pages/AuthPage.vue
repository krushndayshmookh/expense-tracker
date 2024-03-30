<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Sign In</div>
      </q-card-section>

      <q-separator></q-separator>

      <q-card-section class="q-pb-none">
        <q-input
          outlined
          dense
          label="Email"
          v-model="input_email"
          class="q-mb-md"
          autocomplete="email"
        ></q-input>
        <q-input
          outlined
          dense
          label="Password"
          v-model="input_password"
          type="password"
          class="q-mb-md"
          autocomplete="current-password"
        ></q-input>
      </q-card-section>

      <q-card-actions align="between" class="q-px-md q-pb-md q-pt-none">
        <q-toggle v-model="isNewUser" label="New User?"></q-toggle>

        <q-btn
          v-if="isNewUser"
          label="Sign Up and Sign In"
          color="secondary"
          @click="sign_up"
        />

        <q-btn v-else label="Sign In" color="primary" @click="sign_in" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

import { supabase } from "src/boot/supabase";

import { useAuthStore } from "src/stores/auth";
import { useGeneralStore } from "src/stores/general";

export default defineComponent({
  name: "AuthPage",

  setup() {
    const input_email = ref("");
    const input_password = ref("");
    const isNewUser = ref(false);

    const router = useRouter();

    const $q = useQuasar();

    const authStore = useAuthStore();
    const generalStore = useGeneralStore();

    generalStore.show_add_record = false;
    generalStore.title = "Expense Tracker";

    const sign_in = async () => {
      $q.loading.show();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input_email.value,
        password: input_password.value,
      });

      if (error) {
        $q.notify({ type: "negative", message: error.message });
        console.error(JSON.stringify(error));
      } else {
        $q.notify({ type: "positive", message: "Signed in successfully!" });
        await authStore.check_sign_in();
        router.push("/");
      }
      $q.loading.hide();
    };

    const sign_up = async () => {
      $q.loading.show();
      const { data, error } = await supabase.auth.signUp({
        email: input_email.value,
        password: input_password.value,
      });

      if (error) {
        $q.notify({ type: "negative", message: error.message });
        console.error(JSON.stringify(error));
      } else {
        $q.notify({
          type: "positive",
          message: "Signed up successfully! Signing in...",
        });
        await sign_in();
      }
      $q.loading.hide();
    };

    return {
      input_email,
      input_password,
      isNewUser,

      sign_in,

      sign_up,
    };
  },
});
</script>
