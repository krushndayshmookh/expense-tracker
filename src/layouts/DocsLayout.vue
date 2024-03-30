<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="keyboard_arrow_left"
          aria-label="Back"
          @click="$router.back"
        />

        <q-toolbar-title> Expense Tracker </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";

import { useMeta } from "quasar";

export default defineComponent({
  name: "DocsLayout",

  setup() {
    useMeta({
      title: "Docs",
    });
    return {};
  },
});
</script>
