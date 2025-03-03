<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Reset Your Password</div>
      </q-card-section>

      <q-separator></q-separator>

      <q-card-section class="q-pb-none">
        <div v-if="isTokenVerified === null" class="q-my-md">
          <q-spinner color="primary" size="3em" class="q-ma-md" />
          <p>Verifying your reset token...</p>
        </div>

        <div
          v-else-if="isTokenVerified === false"
          class="q-my-md text-negative"
        >
          <p>Your password reset link is invalid or has expired.</p>
          <p>
            Please request a new password reset from the
            <router-link to="/auth">sign in page</router-link>.
          </p>
        </div>

        <template v-else>
          <q-input
            v-model="password"
            type="password"
            label="New Password"
            :rules="[
              (val) =>
                (val && val.length >= 6) ||
                'Password must be at least 6 characters',
            ]"
            outlined
          ></q-input>

          <q-input
            v-model="confirmPassword"
            type="password"
            label="Confirm Password"
            :rules="[(val) => val === password || 'Passwords do not match']"
            class="q-mt-md"
            outlined
          ></q-input>
        </template>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          v-if="isTokenVerified === true"
          color="primary"
          label="Reset Password"
          :disable="!isFormValid"
          :loading="isLoading"
          @click="resetPassword"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { authService } from "src/services/authService";
import { useAuthStore } from "src/stores/auth";

export default defineComponent({
  name: "ResetPasswordPage",

  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const token = ref(null);
    const password = ref("");
    const confirmPassword = ref("");
    const isTokenVerified = ref(null); // null = loading, true = valid, false = invalid
    const isLoading = ref(false);

    const isFormValid = computed(() => {
      return (
        password.value.length >= 6 && password.value === confirmPassword.value
      );
    });

    // Get the reset token from the URL
    onMounted(async () => {
      token.value = route.query.token;

      if (!token.value) {
        isTokenVerified.value = false;
        return;
      }

      try {
        // Verify the token
        await authService.verifyResetToken(token.value);
        isTokenVerified.value = true;
      } catch (error) {
        console.error("Token verification error:", error);
        isTokenVerified.value = false;
      }
    });

    const resetPassword = async () => {
      if (!isFormValid.value) return;

      isLoading.value = true;
      try {
        // Reset the password
        const response = await authService.resetPassword(
          token.value,
          password.value
        );

        // Set the user in the auth store
        if (response.user && response.token) {
          authStore.user = response.user;
          authStore.token = response.token;

          $q.notify({
            type: "positive",
            message: "Your password has been reset successfully!",
          });

          // Redirect to home page
          router.push("/");
        }
      } catch (error) {
        $q.notify({
          type: "negative",
          message:
            error.response?.data?.message ||
            "Failed to reset password. Please try again.",
        });
      } finally {
        isLoading.value = false;
      }
    };

    return {
      password,
      confirmPassword,
      isTokenVerified,
      isLoading,
      isFormValid,
      resetPassword,
    };
  },
});
</script>
