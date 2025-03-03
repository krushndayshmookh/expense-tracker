<template>
  <div class="row justify-center q-px-md">
    <div class="col-12 col-md-8 col-lg-6">
      <h1>Privacy Policy</h1>

      <p>
        This Privacy Policy governs the manner in which our app collects, uses,
        maintains, and discloses information collected from users (each, a
        "User") of the app.
      </p>

      <h2>Information we collect</h2>
      <p>
        We only collect the email and password provided by the User during the
        authentication process. We do not collect any additional personal
        information.
      </p>

      <h2>How we use the information</h2>
      <p>
        The email and password provided by the User are used solely for
        authentication purposes. We do not use this information for any other
        purposes.
      </p>

      <h2>Disclosure of information</h2>
      <p>
        We do not sell, trade, or rent Users' personal identification
        information to others. We may share generic aggregated demographic
        information not linked to any personal identification information
        regarding visitors and users with our business partners, trusted
        affiliates, and advertisers.
      </p>

      <h2>Security</h2>
      <p>
        We implement appropriate data collection, storage, and processing
        practices and security measures to protect against unauthorized access,
        alteration, disclosure, or destruction of your personal information,
        username, password, transaction information, and data stored on our app.
      </p>

      <h2>Changes to this privacy policy</h2>
      <p>
        We have the discretion to update this privacy policy at any time. When
        we do, we will revise the updated date at the bottom of this page. We
        encourage Users to frequently check this page for any changes to stay
        informed about how we are helping to protect the personal information we
        collect.
      </p>

      <h2>Your acceptance of these terms</h2>
      <p>
        By using this app, you signify your acceptance of this policy. If you do
        not agree to this policy, please do not use our app. Your continued use
        of the app following the posting of changes to this policy will be
        deemed your acceptance of those changes.
      </p>

      <h2>Contact us</h2>
      <p>
        If you have any questions about this Privacy Policy, the practices of
        this app, or your dealings with this app, please contact us at
        krushn@dayshmookh.com.
      </p>

      <p>This document was last updated on November 21, 2023.</p>
    </div>
  </div>
</template>

<script>
import { useMeta } from "quasar";

export default {
  name: "PrivacyPolicy",

  setup() {
    useMeta({
      title: "Privacy Policy | Expense Tracker",
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
