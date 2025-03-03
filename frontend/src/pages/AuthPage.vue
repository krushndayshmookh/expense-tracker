<template>
  <q-page class="q-pa-md">
    <q-card v-if="isPasswordReset">
      <q-card-section>
        <div class="text-h6">Reset Password</div>
      </q-card-section>

      <q-separator></q-separator>
      <template v-if="showResetForm">
        <q-card-section class="q-pb-none">
          <q-input
            outlined
            dense
            label="Email"
            v-model="input_email"
            class="q-mb-md"
            autocomplete="email"
          ></q-input>
        </q-card-section>

        <q-card-actions align="between" class="q-px-md q-pb-md q-pt-none">
          <q-btn
            label="back"
            icon="keyboard_arrow_left"
            flat
            color="primary"
            @click="isPasswordReset = false"
          ></q-btn>

          <q-btn
            label="Reset Password"
            color="primary"
            @click="reset_password"
          />
        </q-card-actions>
      </template>

      <template v-else>
        <q-card-section>
          <div class="text-body1">
            Check your email for a link to reset your password. If it doesn't
            appear within a few minutes, check your spam folder.
          </div>
        </q-card-section>

        <q-card-actions align="between" class="q-px-md q-pb-md q-pt-none">
          <q-btn
            label="back"
            icon="keyboard_arrow_left"
            flat
            color="primary"
            @click="isPasswordReset = false"
          ></q-btn>
        </q-card-actions>
      </template>
    </q-card>

    <q-card v-else>
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
          :type="showPassword ? 'text' : 'password'"
          class="q-mb-md"
          autocomplete="new-password"
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
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
      <q-separator></q-separator>
      <q-item v-if="!isNewUser">
        <q-btn
          label="Forgot Password?"
          color="primary"
          no-caps
          flat
          dense
          @click="isPasswordReset = true"
        ></q-btn>
      </q-item>
    </q-card>

    <div class="absolute-bottom">
      <q-card>
        <q-card-section>
          <div class="text-caption text-center">
            By using this app, you agree to our
            <router-link to="/docs/terms-of-service"
              >Terms of Service</router-link
            >
            and
            <router-link to="/docs/privacy-policy">Privacy Policy</router-link>.
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

import { useAuthStore } from "src/stores/auth";
import { useGeneralStore } from "src/stores/general";
import { authService } from "src/services/authService";

export default defineComponent({
  name: "AuthPage",

  setup() {
    const input_email = ref("");
    const input_password = ref("");
    const isNewUser = ref(false);
    const isPasswordReset = ref(false);
    const showResetForm = ref(true);
    const showPassword = ref(false);

    const router = useRouter();
    const $q = useQuasar();

    const authStore = useAuthStore();
    const generalStore = useGeneralStore();

    generalStore.show_add_record = false;
    generalStore.title = "Expense Tracker";

    const sign_in = async () => {
      $q.loading.show();
      try {
        const success = await authStore.sign_in(
          input_email.value,
          input_password.value
        );
        if (success) {
          $q.notify({ type: "positive", message: "Signed in successfully!" });
          router.push("/");
        }
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || "Error signing in",
        });
      } finally {
        $q.loading.hide();
      }
    };

    const sign_up = async () => {
      $q.loading.show();
      try {
        const success = await authStore.sign_up(
          input_email.value,
          input_password.value
        );
        if (success) {
          $q.notify({
            type: "positive",
            message: "Signed up successfully! You are now signed in.",
          });
          router.push("/");
        }
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || "Error signing up",
        });
      } finally {
        $q.loading.hide();
      }
    };

    const reset_password = async () => {
      $q.loading.show();
      try {
        await authService.requestPasswordReset(input_email.value);
        $q.notify({
          type: "positive",
          message:
            "If an account with that email exists, a password reset link has been sent.",
          caption: "Please check your email inbox and spam folder.",
        });
        showResetForm.value = false;
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || "Error resetting password",
        });
      } finally {
        $q.loading.hide();
      }
    };

    return {
      input_email,
      input_password,
      isNewUser,
      isPasswordReset,
      showResetForm,
      showPassword,

      sign_in,
      reset_password,
      sign_up,
    };
  },
});
</script>
