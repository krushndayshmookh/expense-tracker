<template>About</template>

<script>
import { defineComponent, onMounted, computed } from "vue";

import { useQuasar, date, is } from "quasar";

import { supabase } from "src/boot/supabase";

import { useAuthStore } from "src/stores/auth";
import { useRecordStore } from "src/stores/record";
import { useGeneralStore } from "src/stores/general";

export default defineComponent({
  name: "AboutPage",

  setup() {
    const generalStore = useGeneralStore();
    generalStore.show_add_record = false;
    generalStore.title = "About"

    return {};
  },
});
</script>
