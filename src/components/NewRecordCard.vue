<template>
  <q-card style="min-width: 80vmin">
    <q-card-section>
      <div class="text-h6">
        Create New Record

        <q-btn
          round
          icon="close"
          v-close-popup
          dense
          flat
          class="float-right"
        ></q-btn>
      </div>
    </q-card-section>
    <q-separator></q-separator>
    <q-card-section>
      <q-input
        label="Amount"
        v-model="newRecord.amountInput"
        mask="#.##"
        fill-mask="0"
        reverse-fill-mask
        input-class="text-right"
        outlined
        class="q-mb-sm"
      />

      <q-select
        v-model="newRecord.transaction_category_id"
        :options="category_options"
        dense
        outlined
        emit-value
        map-options
        class="q-mb-sm"
      />

      <q-input
        label="Description"
        v-model="newRecord.description"
        outlined
        clearable
        class="q-mb-sm"
      />

      <q-select
        v-model="newRecord.transaction_type"
        :options="transaction_type_options"
        dense
        outlined
        emit-value
        map-options
        class="q-mb-sm"
      />

      <q-select
        v-model="newRecord.record_sheet_id"
        :options="sheet_options"
        dense
        outlined
        emit-value
        map-options
        class="q-mb-md"
      />

      <q-btn
        class="full-width"
        label="Add Record"
        color="primary"
        @click="create_record"
      >
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, reactive, computed } from "vue";
import { useRouter } from "vue-router";

import { useQuasar } from "quasar";

import { supabase } from "src/boot/supabase";

import { useAuthStore } from "src/stores/auth";
import { useRecordStore } from "src/stores/record";

export default defineComponent({
  name: "NewRecordCard",

  emits: ["close"],

  setup(_, { emit }) {
    const $q = useQuasar();

    const authStore = useAuthStore();
    const recordStore = useRecordStore();

    const router = useRouter();

    const defaultCategory = computed(() =>
      recordStore.get_id_for_label("Miscellaneous")
    );

    const newRecord = reactive({
      record_sheet_id: recordStore.record_sheets[0].id,
      transaction_category_id: defaultCategory.value,
      amountInput: 0,
      amount: 0,
      user_id: authStore.user.id,
      description: "",
      transaction_type: "expense",
    });

    const create_record = async () => {
      $q.loading.show();

      newRecord.amount = parseFloat(newRecord.amountInput) * 100;
      delete newRecord.amountInput;

      const { data, error } = await supabase
        .from("transaction_records")
        .insert([newRecord])
        .single();
      if (error) {
        $q.notify({ type: "negative", message: error.message });
        console.error(JSON.stringify(error));
      } else {
        $q.notify({
          type: "positive",
          message: `Created record successfully!`,
        });

        emit("close");
        router.push(`/sheets/${newRecord.record_sheet_id}`);
      }
      $q.loading.hide();
    };

    const category_options = computed(() => recordStore.categoryKVList);
    const sheet_options = computed(() => recordStore.recordSheetKVList);
    const transaction_type_options = computed(() => [
      { label: "Expense", value: "expense" },
      { label: "Income", value: "income" },
    ]);

    return {
      newRecord,
      create_record,

      category_options,
      sheet_options,
      transaction_type_options,
    };
  },
});
</script>
