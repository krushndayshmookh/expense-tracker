<template>
  <q-page>
    <q-tabs v-model="record_tab">
      <q-tab name="expenses" label="Expenses"></q-tab>
      <q-tab name="income" label="Income"></q-tab>
    </q-tabs>

    <q-separator></q-separator>

    <q-tab-panels swipeable v-model="record_tab">
      <q-tab-panel name="expenses" class="q-pa-none">
        <q-list>
          <record-item
            v-for="record in expense_records"
            :key="record.id"
            :record="record"
            @delete="delete_record"
          />
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="income" class="q-pa-none">
        <q-list>
          <record-item
            v-for="record in income_records"
            :key="record.id"
            :record="record"
            @delete="delete_record"
          />
        </q-list>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar, date } from "quasar";

import { supabase } from "src/boot/supabase";

import { useAuthStore } from "src/stores/auth";
import { useRecordStore } from "src/stores/record";

import RecordItem from "src/components/RecordItem.vue";

export default defineComponent({
  name: "RecordSheetPage",

  components: {
    RecordItem,
  },

  setup() {
    const record_tab = ref("expenses");

    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const record_sheet_id = route.params.sheet_id;

    const recordStore = useRecordStore();

    const categories_name_map = recordStore.transaction_categories_name_map;

    const expense_records = ref([]);
    const income_records = ref([]);

    const fetch_records = async () => {
      const { data, error } = await supabase
        .from("transaction_records")
        .select("*")
        .eq("record_sheet_id", record_sheet_id)
        .order("created_at", { ascending: false });
      if (error) {
        $q.notify({
          message: "Error fetching records",
          type: "negative",
        });
        return;
      }

      expense_records.value = data.filter(
        (record) => record.transaction_type === "expense"
      );

      income_records.value = data.filter(
        (record) => record.transaction_type === "income"
      );
    };

    onMounted(async () => {
      await fetch_records();
    });

    const delete_record = async (record_id) => {
      $q.dialog({
        title: "Confirm Delete",
        message: "Are you sure you want to delete this record?",
        cancel: true,
      }).onOk(async () => {
        const { data, error } = await supabase
          .from("transaction_records")
          .delete()
          .eq("id", record_id);
        if (error) {
          $q.notify({
            message: "Error deleting record",
            type: "negative",
          });
          return;
        }

        $q.notify({
          message: "Deleted record successfully",
          type: "positive",
        });

        await fetch_records();
      });
    };

    return {
      record_sheet_id,
      record_tab,

      expense_records,
      income_records,

      categories_name_map,

      delete_record,
    };
  },
});
</script>
