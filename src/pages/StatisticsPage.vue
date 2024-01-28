<template>
  <q-page>
    <q-card class="q-ma-md">
      <q-card-section>
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

    <q-card class="q-ma-md">
      <q-list>
        <q-item-label header> Expenses </q-item-label>

        <q-separator></q-separator>

        <q-item v-for="expense in groupedExpenses" :key="expense.category_id">
          <q-item-section>
            <q-item-label>{{
              categories_name_map[expense.category_id]
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-negative">{{
              $filters.amount(expense.sum)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-card class="q-ma-md">
      <q-list>
        <q-item-label header> Income </q-item-label>

        <q-separator></q-separator>

        <q-item v-for="income in groupedIncome" :key="income.category_id">
          <q-item-section>
            <q-item-label>{{
              categories_name_map[income.category_id]
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-positive">{{
              $filters.amount(income.sum)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-card class="q-ma-md">
      <chart :options="chartOptions"></chart>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed, nextTick } from "vue";
import { useRoute } from "vue-router";

import { useRecordStore } from "src/stores/record";
import { useGeneralStore } from "src/stores/general";

import { Chart } from "highcharts-vue";

export default defineComponent({
  name: "StatisticsPage",

  components: {
    Chart,
  },

  setup() {
    const record_tab = ref("expenses");

    const route = useRoute();

    const record_sheet_id = route.params.sheet_id;

    const recordStore = useRecordStore();
    const generalStore = useGeneralStore();

    generalStore.show_add_record = false;

    recordStore.selected_record_sheet_id = record_sheet_id;

    const record_sheet_name =
      recordStore.get_name_for_sheet_id(record_sheet_id);
    generalStore.title = record_sheet_name;

    const categories_name_map = recordStore.transaction_categories_name_map;

    const selected_sheet_records = computed(
      () => recordStore.selected_sheet_records
    );

    const expense_records = computed(() =>
      selected_sheet_records.value.filter(
        (record) => record.transaction_type === "expense"
      )
    );

    const income_records = computed(() =>
      selected_sheet_records.value.filter(
        (record) => record.transaction_type === "income"
      )
    );

    const expenses = computed(() =>
      expense_records.value.reduce((acc, record) => acc + record.amount, 0)
    );

    const income = computed(() =>
      income_records.value.reduce((acc, record) => acc + record.amount, 0)
    );

    const balance = computed(() => income.value - expenses.value);

    const fnGroupExpenses = (records) => {
      const grouped = {};

      records.value.forEach((record) => {
        const transaction_category_id = record.transaction_category_id;

        if (grouped[transaction_category_id]) {
          grouped[transaction_category_id].push(record);
        } else {
          grouped[transaction_category_id] = [record];
        }
      });

      // sum up the amounts

      const catGrouped = [];

      Object.keys(grouped).forEach((key) => {
        const records = grouped[key];

        const sum = records.reduce((acc, record) => acc + record.amount, 0);

        catGrouped.push({
          category_id: key,
          sum,
        });
      });

      // sort by sum

      catGrouped.sort((a, b) => b.sum - a.sum);

      return catGrouped;
    };

    const groupedExpenses = ref([]);

    const groupedIncome = ref([]);

    onMounted(async () => {
      await recordStore.fetch_records();
      nextTick(() => {
        groupedExpenses.value = fnGroupExpenses(expense_records);
        groupedIncome.value = fnGroupExpenses(income_records);
      });
    });

    const chartOptions = computed(() => {
      return {
        chart: {
          type: "bar",
          height: 800,
          // width:200
        },
        title: {
          text: "",
          enabled: false,
        },
        xAxis: {
          type: "datetime",
        },
        series: [
          {
            name: "Expenses",
            data: recordStore.sheet_datewise_expenses,
          },
        ],
        plotOptions: {
          series: {
            pointWidth: 10,
            marker: {
              enabled: true,
            },
          },
        },
      };
    });

    return {
      record_sheet_id,
      record_tab,

      expense_records,
      income_records,

      categories_name_map,

      balance,
      expenses,
      income,

      groupedExpenses,
      groupedIncome,

      chartOptions,
    };
  },
});
</script>
