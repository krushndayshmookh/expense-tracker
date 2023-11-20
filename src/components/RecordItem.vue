<template>
  <q-item
    clickable
    :to="`/sheets/${record.record_sheet_id}/records/${record.id}`"
  >
    <q-menu touch-position context-menu>
      <q-list dense style="min-width: 120px">
        <q-item clickable v-close-popup @click="delete_record">
          <q-item-section side>
            <q-icon name="delete" color="negative" size="16px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Delete</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <q-item-section>
      <q-item-label>{{ record.description }}</q-item-label>
      <q-item-label caption>{{
        categories_name_map[record.transaction_category_id]
      }}</q-item-label>
    </q-item-section>
    <q-item-section side top>
      <q-item-label :class="colorClass">{{
        $filters.amount(record.amount)
      }}</q-item-label>
      <q-item-label caption>{{
        $filters.shortDate(record.created_at)
      }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from "vue";

import { useRecordStore } from "src/stores/record";

export default defineComponent({
  name: "RecordItem",

  props: {
    record: {
      type: Object,
      required: true,
    },
  },

  emits: ["delete"],

  setup(props, { emit }) {
    const recordStore = useRecordStore();

    const delete_record = () => {
      emit("delete", props.record.id);
    };

    const colorClass =
      props.record.transaction_type === "expense"
        ? "text-negative"
        : "text-positive";

    return {
      delete_record,
      colorClass,
      categories_name_map: recordStore.transaction_categories_name_map,
    };
  },
});
</script>
