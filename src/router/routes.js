const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "auth",
        component: () => import("pages/AuthPage.vue"),
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: "sheets/:sheet_id",
        component: () => import("pages/RecordSheetPage.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "about",
        component: () => import("pages/AboutPage.vue"),
        meta: {
          requiresAuth: false,
        },
      },
      {
        path: "settings",
        component: () => import("pages/SettingsPage.vue"),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
