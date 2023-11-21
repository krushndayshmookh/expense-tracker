<template>
  <q-card style="min-width: 80vmin">
    <q-card-section>
      <div class="text-h6">
        {{ isEdit ? "Update" : "Create New" }} Record

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
        type="number"
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

      <div class="row q-col-gutter-md items-center">
        <div class="col-auto" v-if="isEdit">
          <q-btn
            round
            flat
            icon="delete"
            color="negative"
            @click="delete_record"
          >
          </q-btn>
        </div>
        <div class="col">
          <q-btn
            class="full-width"
            :label="`${isEdit ? 'Update' : 'Add'} Record`"
            color="primary"
            @click="create_record"
          >
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, reactive, computed } from "vue";

import { useQuasar } from "quasar";

import { supabase } from "src/boot/supabase";

import { useAuthStore } from "src/stores/auth";
import { useRecordStore } from "src/stores/record";

export default defineComponent({
  name: "NewRecordCard",

  props: {
    isEdit: {
      type: Boolean,
      default: false,
    },
    record: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["close"],

  setup(props, { emit }) {
    const $q = useQuasar();

    const authStore = useAuthStore();
    const recordStore = useRecordStore();

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

    if (props.isEdit) {
      newRecord.record_sheet_id = props.record.record_sheet_id;
      newRecord.transaction_category_id = props.record.transaction_category_id;
      newRecord.amountInput = props.record.amount;
      newRecord.description = props.record.description;
      newRecord.transaction_type = props.record.transaction_type;
    }

    const create_record = async () => {
      $q.loading.show();

      const dataToSend = {
        record_sheet_id: newRecord.record_sheet_id,
        transaction_category_id: newRecord.transaction_category_id,
        amount: parseFloat(newRecord.amountInput) * 100,
        user_id: authStore.user.id,
        description: newRecord.description,
        transaction_type: newRecord.transaction_type,
      };

      if (props.isEdit) {
        const { data, error } = await supabase
          .from("transaction_records")
          .update(dataToSend)
          .eq("id", props.record.id)
          .single();
        if (error) {
          $q.notify({ type: "negative", message: error.message });
          console.error(JSON.stringify(error));
        } else {
          $q.notify({
            type: "positive",
            message: `Updated record successfully!`,
          });

          emit("close");
          // router.push(`/sheets/${newRecord.record_sheet_id}`);
        }
      } else {
        const { data, error } = await supabase
          .from("transaction_records")
          .insert([dataToSend])
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
          // router.push(`/sheets/${newRecord.record_sheet_id}`);
        }
      }

      $q.loading.hide();
    };

    const category_options = computed(() => recordStore.categoryKVList);
    const sheet_options = computed(() => recordStore.recordSheetKVList);
    const transaction_type_options = computed(() => [
      { label: "Expense", value: "expense" },
      { label: "Income", value: "income" },
    ]);

    const delete_record = async () => {
      $q.dialog({
        title: "Confirm Delete",
        message: "Are you sure you want to delete this record?",
        cancel: true,
        ok: "Delete",
      }).onOk(async () => {
        const { data, error } = await supabase
          .from("transaction_records")
          .delete()
          .eq("id", props.record.id);
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
        emit("close");
      });
    };

    return {
      newRecord,
      create_record,

      category_options,
      sheet_options,
      transaction_type_options,

      delete_record,
    };
  },
});
</script>
