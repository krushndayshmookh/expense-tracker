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

        <q-toolbar-title> Expense Tracker </q-toolbar-title>
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

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        round
        size="lg"
        v-if="$route.meta.requiresAuth"
        icon="add"
        color="primary"
        @click="openNewRecordDialog = true"
      />
    </q-page-sticky>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onBeforeMount, computed } from "vue";

import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "src/stores/auth";

import NewRecordCard from "src/components/NewRecordCard.vue";

const MENU_ITEMS = [
  {
    title: "Record Sheets",
    to: "/",
    icon: "list",
    requiresAuth: true,
  },
  {
    title: "About",
    to: "/about",
    icon: "info",
    requiresAuth: false,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: "settings",
    requiresAuth: true,
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    NewRecordCard,
  },

  setup() {
    const authStore = useAuthStore();

    const route = useRoute();
    const router = useRouter();

    onBeforeMount(async () => {
      if (route.meta.requiresAuth) {
        const sign = await authStore.check_sign_in();

        if (!sign) {
          router.push("/auth");
        }
      }
    });

    const leftDrawerOpen = ref(false);
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const sign_out = async () => {
      const sign = await authStore.sign_out();
      if (sign) {
        router.push("/auth");
      }
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
    };
  },
});
</script>
