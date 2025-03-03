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
        input-class="text-right"
        outlined
        class="q-mb-sm"
        autofocus
      />

      <q-select
        v-model="newRecord.category_id"
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

      <q-input dense outlined v-model="newRecord.created_at" class="q-mb-md">
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="newRecord.created_at" mask="YYYY-MM-DD HH:mm">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>

        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time
                v-model="newRecord.created_at"
                mask="YYYY-MM-DD HH:mm"
                format24h
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

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
import { useQuasar, date } from "quasar";

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
      record_sheet_id:
        recordStore.record_sheets.length > 0
          ? recordStore.record_sheets[0]._id
          : null,
      category_id: defaultCategory.value,
      amountInput: null,
      amount: 0,
      description: "",
      transaction_type: "expense",
      created_at: date.formatDate(new Date(), "YYYY-MM-DD HH:mm"),
    });

    if (props.isEdit) {
      newRecord.record_sheet_id = props.record.record_sheet_id;
      newRecord.category_id = props.record.category_id;
      newRecord.amountInput = props.record.amount / 100;
      newRecord.description = props.record.description;
      newRecord.transaction_type = props.record.transaction_type;
      newRecord.created_at = date.formatDate(
        new Date(props.record.created_at),
        "YYYY-MM-DD HH:mm"
      );
    }

    const create_record = async () => {
      $q.loading.show();

      try {
        const dataToSend = {
          record_sheet_id: newRecord.record_sheet_id,
          category_id: newRecord.category_id,
          amount: parseFloat(newRecord.amountInput) * 100,
          description: newRecord.description,
          transaction_type: newRecord.transaction_type,
        };

        if (newRecord.created_at) {
          dataToSend.created_at = new Date(newRecord.created_at);
        }

        if (props.isEdit) {
          await recordStore.update_transaction(props.record._id, dataToSend);

          $q.notify({
            type: "positive",
            message: `Updated record successfully!`,
          });

          emit("close");
        } else {
          await recordStore.create_transaction(dataToSend);

          $q.notify({
            type: "positive",
            message: `Created record successfully!`,
          });

          emit("close");
        }
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || "Error saving record",
        });
        console.error(error);
      } finally {
        $q.loading.hide();
      }
    };

    const delete_record = async () => {
      $q.loading.show();

      try {
        await recordStore.delete_transaction(props.record._id);

        $q.notify({
          type: "positive",
          message: `Deleted record successfully!`,
        });

        emit("close");
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || "Error deleting record",
        });
        console.error(error);
      } finally {
        $q.loading.hide();
      }
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
      delete_record,
      category_options,
      sheet_options,
      transaction_type_options,
    };
  },
});
</script>
