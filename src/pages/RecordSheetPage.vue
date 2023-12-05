<template>
  <q-page>
    <div class="q-pa-md">
      <q-card>
        <div class="row">
          <div class="col">
            <q-item-label header> Overview </q-item-label>
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
          </div>

          <q-separator vertical></q-separator>

          <div class="col-auto q-pa-xs column q-gutter-xs">
            <q-btn
              dense
              flat
              round
              :icon="searchButtonIcon"
              :color="searchButtonColor"
              @click="toggleSearch"
            ></q-btn>

            <q-btn
              dense
              flat
              round
              icon="bar_chart"
              color="primary"
              :to="`/sheets/${record_sheet_id}/statistics`"
            ></q-btn>
          </div>
        </div>
      </q-card>

      <!-- Search Records -->
      <transition
        appear
        enter-active-class="animated fadeInDown"
        leave-active-class="animated fadeOutUp"
      >
        <q-card v-if="searchEnabled" class="q-mt-md">
          <q-card-section>
            <q-input
              outlined
              dense
              v-model="searchQ"
              placeholder="Search description or amount"
              clearable
              autofocus
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>

          <q-separator></q-separator>

          <q-list v-if="searchQ">
            <TransitionGroup name="fade">
              <record-item
                v-for="record in search_results"
                :key="record.id"
                :record="record"
                @edit="open_edit_record"
              />

              <q-item v-if="search_results.length === 0">
                <q-item-section side>
                  <q-icon name="warning" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption> No results found. </q-item-label>
                </q-item-section>
              </q-item>
            </TransitionGroup>
          </q-list>

          <!-- <q-card-section v-else>
          <q-item-label caption>Search for something...</q-item-label>
        </q-card-section> -->
        </q-card>
      </transition>
    </div>

    <q-tabs v-model="record_tab">
      <q-tab name="expenses" label="Expenses"></q-tab>
      <q-tab name="income" label="Income"></q-tab>
    </q-tabs>

    <q-separator></q-separator>

    <q-tab-panels swipeable v-model="record_tab">
      <q-tab-panel name="expenses" class="q-pa-none">
        <q-list class="q-mb-xl q-pb-xl">
          <TransitionGroup name="fade">
            <record-item
              v-for="record in expense_records"
              :key="record.id"
              :record="record"
              @edit="open_edit_record"
            />
          </TransitionGroup>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="income" class="q-pa-none">
        <q-list class="q-mb-xl q-pb-xl">
          <TransitionGroup name="fade">
            <record-item
              v-for="record in income_records"
              :key="record.id"
              :record="record"
              @edit="open_edit_record"
            />
          </TransitionGroup>
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
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

import { useRecordStore } from "src/stores/record";
import { useGeneralStore } from "src/stores/general";

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

    const route = useRoute();

    const record_sheet_id = route.params.sheet_id;

    const recordStore = useRecordStore();
    const generalStore = useGeneralStore();

    generalStore.show_add_record = true;

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

    onMounted(async () => {
      await recordStore.fetch_records();
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
    };

    // Search
    const searchQ = ref("");
    const searchEnabled = ref(false);

    const searchButtonIcon = computed(() =>
      searchEnabled.value ? "close" : "search"
    );

    const searchButtonColor = computed(() =>
      searchEnabled.value ? "negative" : "primary"
    );

    const toggleSearch = () => {
      searchEnabled.value = !searchEnabled.value;
      searchQ.value = "";
    };

    const search_results = computed(() =>
      selected_sheet_records.value.filter(
        (record) =>
          record.description
            .toLowerCase()
            .includes(searchQ.value.toLowerCase()) ||
          record.amount.toString().includes(searchQ.value)
      )
    );

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

      // Search
      searchQ,
      searchEnabled,
      toggleSearch,
      searchButtonIcon,
      searchButtonColor,
      search_results,
    };
  },
});
</script>

<style scoped>
/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>
