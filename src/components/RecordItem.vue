<template>
  <q-item clickable @click="edit_record">
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

  emits: ["edit"],

  setup(props, { emit }) {
    const recordStore = useRecordStore();

    const edit_record = () => {
      emit("edit", props.record);
    };

    const colorClass =
      props.record.transaction_type === "expense"
        ? "text-negative"
        : "text-positive";

    return {
      edit_record,

      colorClass,
      categories_name_map: recordStore.transaction_categories_name_map,
    };
  },
});
</script>
