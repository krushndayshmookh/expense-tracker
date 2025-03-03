<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card>
      <q-card-section class="text-center">
        <q-avatar>
          <q-img src="/icons/favicon-96x96.png"></q-img>
        </q-avatar>
        <div class="text-h6 q-pt-lg q-pb-md">Expense Tracker</div>
        <div class="text-caption">v1.0.0</div>
      </q-card-section>
      <q-separator></q-separator>

      <q-card-section class="text-center">
        <div>
          This is a simple expense tracker app built with Vue.js, Quasar
          Framework, Node.js, Express, and MongoDB.
        </div>
      </q-card-section>

      <q-separator></q-separator>

      <q-list>
        <q-item
          clickable
          v-ripple
          tag="a"
          target="blank"
          href="https://dayshmookh.com"
        >
          <q-item-section>
            <q-item-label>Author: Krushn Dayshmookh</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="open_in_new" />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          tag="a"
          target="blank"
          href="https://github.com/krushndayshmookh/expense-tracker"
        >
          <q-item-section>
            <q-item-label>Source Code: GitHub</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="open_in_new" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/docs/privacy-policy">
          <q-item-section>
            <q-item-label>Privacy Policy</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/docs/terms-of-service">
          <q-item-section>
            <q-item-label>Terms of Service</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

import { useGeneralStore } from "src/stores/general";

export default defineComponent({
  name: "AboutPage",

  setup() {
    const generalStore = useGeneralStore();
    generalStore.show_add_record = false;
    generalStore.title = "About";

    return {};
  },
});
</script>
