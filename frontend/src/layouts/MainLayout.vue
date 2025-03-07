<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> {{ pageTitle }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item
          v-for="link in menuItems"
          :key="link.title"
          clickable
          :to="link.to"
          exact
          exact-active-class="bg-grey-3"
        >
          <q-item-section side>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="sign_out">
          <q-item-section side>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sign Out</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="openNewRecordDialog" persistent>
      <new-record-card @close="handleCloseDialog" />
    </q-dialog>

    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      v-if="showAddButton"
    >
      <q-btn
        round
        size="lg"
        icon="add"
        color="primary"
        @click="openNewRecordDialog = true"
      />
    </q-page-sticky>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from "vue";

import { useQuasar } from "quasar";

import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "src/stores/auth";
import { useGeneralStore } from "src/stores/general";

import NewRecordCard from "src/components/NewRecordCard.vue";

import MENU_ITEMS from "src/utils/menu_items";

export default defineComponent({
  name: "MainLayout",

  components: {
    NewRecordCard,
  },

  setup() {
    const authStore = useAuthStore();
    const generalStore = useGeneralStore();

    const $q = useQuasar();

    const showAddButton = computed(() => {
      return generalStore.show_add_record;
    });

    const pageTitle = computed(() => {
      return generalStore.title;
    });

    const route = useRoute();
    const router = useRouter();

    const leftDrawerOpen = ref(false);
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const sign_out = async () => {
      $q.loading.show();
      const sign = await authStore.sign_out();
      if (sign) {
        router.push("/auth");
      }
      $q.loading.hide();
    };

    const menuItems = computed(() => {
      return MENU_ITEMS.filter((item) => {
        if (item.requiresAuth) {
          return authStore.user;
        }
        return true;
      });
    });

    const openNewRecordDialog = ref(false);

    const handleCloseDialog = () => {
      openNewRecordDialog.value = false;
    };

    return {
      menuItems,
      leftDrawerOpen,
      toggleLeftDrawer,

      sign_out,

      openNewRecordDialog,
      handleCloseDialog,

      showAddButton,
      pageTitle,
    };
  },
});
</script>
