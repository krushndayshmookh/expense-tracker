<template>
  <q-page>
    <div class="q-pa-md">
      <q-card>
        <q-item-label header>Overview</q-item-label>
        <q-card-section class="q-pt-none">
          <div class="row">
            <div class="col">
              <q-item-section>
                <q-item-label caption>Balance</q-item-label>
                <q-item-label
                  :class="balance < 0 ? 'text-negative' : 'text-positive'"
                >
                  {{ $filters.amount(balance) }}
                </q-item-label>
              </q-item-section>
            </div>
            <div class="col">
              <q-item-section>
                <q-item-label caption>Expenses</q-item-label>
                <q-item-label class="text-negative">
                  {{ $filters.amount(expenses) }}
                </q-item-label>
              </q-item-section>
            </div>
            <div class="col">
              <q-item-section>
                <q-item-label caption>Income</q-item-label>
                <q-item-label>
                  {{ $filters.amount(income) }}
                </q-item-label>
              </q-item-section>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

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
            @edit="open_edit_record"
          />
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="income" class="q-pa-none">
        <q-list>
          <record-item
            v-for="record in income_records"
            :key="record.id"
            :record="record"
            @edit="open_edit_record"
          />
        </q-list>
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="openEditRecordDialog" persistent>
      <new-record-card
        @close="handleCloseDialog"
        is-edit
        :record="selectedRecord"
      />
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useQuasar, date } from "quasar";

import { supabase } from "src/boot/supabase";

import { useRecordStore } from "src/stores/record";

import RecordItem from "src/components/RecordItem.vue";
import NewRecordCard from "src/components/NewRecordCard.vue";

export default defineComponent({
  name: "RecordSheetPage",

  components: {
    RecordItem,
    NewRecordCard,
  },

  setup() {
    const record_tab = ref("expenses");

    const $q = useQuasar();

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

      expenses.value = expense_records.value.reduce(
        (acc, record) => acc + record.amount,
        0
      );

      income.value = income_records.value.reduce(
        (acc, record) => acc + record.amount,
        0
      );

      balance.value = income.value - expenses.value;
    };

    onMounted(async () => {
      await fetch_records();
    });

    const selectedRecord = ref(null);
    const openEditRecordDialog = ref(false);

    const open_edit_record = (record) => {
      selectedRecord.value = record;
      openEditRecordDialog.value = true;
    };

    const handleCloseDialog = async () => {
      selectedRecord.value = null;
      openEditRecordDialog.value = false;
      await fetch_records();
    };

    const balance = ref(0);
    const expenses = ref(0);
    const income = ref(0);

    return {
      record_sheet_id,
      record_tab,

      expense_records,
      income_records,

      categories_name_map,

      selectedRecord,
      openEditRecordDialog,
      open_edit_record,
      handleCloseDialog,

      balance,
      expenses,
      income,
    };
  },
});
</script>
