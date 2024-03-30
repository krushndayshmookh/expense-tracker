const modulesToLoad = import.meta.env.VITE_BUILD_MODULES.split(",");

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
          module: "base",
        },
      },
      {
        path: "auth",
        component: () => import("pages/AuthPage.vue"),
        meta: {
          requiresAuth: false,
          module: "base",
        },
      },
      {
        path: "sheets/:sheet_id",
        component: () => import("pages/RecordSheetPage.vue"),
        meta: {
          requiresAuth: true,
          module: "expenses",
        },
      },
      {
        path: "sheets/:sheet_id/statistics",
        component: () => import("pages/StatisticsPage.vue"),
        meta: {
          requiresAuth: true,
          module: "expenses",
        },
      },
      {
        path: "tasks",
        component: () => import("pages/TasksPage.vue"),
        meta: {
          requiresAuth: true,
          module: "tasks",
        },
      },
      {
        path: "about",
        component: () => import("pages/AboutPage.vue"),
        meta: {
          requiresAuth: false,
          module: "base",
        },
      },
      {
        path: "settings",
        component: () => import("pages/SettingsPage.vue"),
        meta: {
          requiresAuth: true,
          module: "base",
        },
      },
    ],
  },

  {
    path: "/docs",
    component: () => import("layouts/DocsLayout.vue"),
    children: [
      {
        path: "privacy-policy",
        component: () => import("pages/docs/PrivacyPolicy.vue"),
        meta: {
          requiresAuth: false,
          module: "base",
        },
      },
      {
        path: "terms-of-service",
        component: () => import("pages/docs/TermsOfService.vue"),
        meta: {
          requiresAuth: false,
          module: "base",
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

routes[0].children = routes[0].children.filter((route) =>
  modulesToLoad.includes(route.meta.module)
);

export default routes;
