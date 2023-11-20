<template>
  <q-page>
    <q-list>
      <q-item-label header>Your Record Sheets</q-item-label>
      <q-item
        v-for="record_sheet in record_sheets"
        :key="record_sheet.id"
        clickable
        :to="`/sheets/${record_sheet.id}`"
      >
        <q-item-section>
          <q-item-label>{{ record_sheet.name }}</q-item-label>
          <q-item-label caption>{{
            $filters.shortDate(record_sheet.created_at)
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, computed } from "vue";

import { useQuasar, date } from "quasar";

import { supabase } from "src/boot/supabase";

import { useAuthStore } from "src/stores/auth";
import { useRecordStore } from "src/stores/record";

export default defineComponent({
  name: "IndexPage",

  setup() {
    const record_sheets = computed(() => recordStore.record_sheets);

    const $q = useQuasar();

    const authStore = useAuthStore();
    const recordStore = useRecordStore();

    const create_default_sheet = async () => {
      const timeStamp = Date.now();
      const sheet_name = date.formatDate(timeStamp, "YYYY MMMM");

      $q.loading.show();

      const { data, error } = await supabase
        .from("record_sheets")
        .insert([
          { user_id: authStore.user.id, name: sheet_name, is_active: true },
        ])
        .single();
      if (error) {
        $q.notify({ type: "negative", message: error.message });
        console.error(JSON.stringify(error));
      } else {
        $q.notify({
          type: "positive",
          message: `Created sheet "${sheet_name}" successfully!`,
        });

        await fetch_sheets();
      }
    };

    const fetch_sheets = async () => {
      $q.loading.show();

      const { data, error } = await supabase
        .from("record_sheets")
        .select("*")
        .eq("user_id", authStore.user.id)
        .order("created_at", { ascending: false });
      if (error) {
        $q.notify({ type: "negative", message: error.message });
        console.error(JSON.stringify(error));
      } else {
        recordStore.record_sheets = data;
      }
      $q.loading.hide();
    };

    const fetch_categories = async () => {
      const { data, error } = await supabase
        .from("transaction_categories")
        .select("*")
        .or(`user_id.eq.${authStore.user.id},user_id.is.null`);

      if (error) {
        $q.notify({
          message: "Error fetching categories",
          type: "negative",
        });
        return;
      }

      recordStore.transaction_categories = data;
      recordStore.transaction_categories_name_map = data.reduce((acc, cur) => {
        acc[cur.id] = cur.label;
        return acc;
      }, {});
    };

    onMounted(async () => {
      await fetch_sheets();

      if (!record_sheets.value.length) {
        await create_default_sheet();
      }

      if (!recordStore.transaction_categories.length) {
        await fetch_categories();
      }
    });

    return {
      record_sheets,
    };
  },
});
</script>
