import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthStore } from "src/stores/auth";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    // Check if the route requires authentication
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (!requiresAuth) {
      // If the route doesn't require auth, proceed
      return next();
    }

    // For protected routes, check authentication
    const authStore = useAuthStore();

    // Single check for authentication, leveraging our improved check_sign_in method
    const isAuthenticated = await authStore.check_sign_in();

    if (isAuthenticated) {
      return next();
    }

    // Not authenticated, redirect to login
    return next("/auth");
  });

  return Router;
});
