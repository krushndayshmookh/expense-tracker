<template>
  <div class="row justify-center q-px-md">
    <div class="col-12 col-md-8 col-lg-6">
      <h1>Terms of Service</h1>
      <p>
        Welcome to our app! By using our services, you agree to comply with and
        be bound by the following terms and conditions:
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using our app, you acknowledge that you have read,
        understood, and agree to be bound by these terms and conditions.
      </p>

      <h2>2. User Responsibilities</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        and password, and for all activities that occur under your account.
      </p>

      <h2>3. Intellectual Property</h2>
      <p>
        All content and materials available on our app, including but not
        limited to text, graphics, logos, button icons, images, audio clips, and
        software, are the property of our company.
      </p>

      <h2>4. Limitation of Liability</h2>
      <p>
        We shall not be liable for any direct, indirect, incidental, special, or
        consequential damages arising out of or in any way connected with the
        use of our app.
      </p>

      <h2>5. Governing Law</h2>
      <p>
        These terms and conditions shall be governed by and construed in
        accordance with the laws of your jurisdiction.
      </p>

      <h2>6. Changes to Terms</h2>
      <p>
        We reserve the right to modify or replace these terms and conditions at
        any time without prior notice. Your continued use of the app after any
        such changes constitutes your acceptance of the new terms and
        conditions.
      </p>

      <h2>7. Contact Us</h2>
      <p>
        If you have any questions or concerns about these terms and conditions,
        please contact us at krushn@dayshmookh.com.
      </p>
    </div>
  </div>
</template>

<script>
import { useMeta } from "quasar";

export default {
  name: "TermsOfService",

  setup() {
    useMeta({
      title: "Terms of Service | Expense Tracker",
    });
    return {};
  },
};
</script>

<style scoped lang="scss">
h1 {
  font-size: 2.25rem;
}

h2 {
  font-size: 1.5rem;
  margin-top: 1.5rem;
}
</style>
