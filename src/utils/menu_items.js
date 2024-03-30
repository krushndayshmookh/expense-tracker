const modulesToLoad = import.meta.env.VITE_BUILD_MODULES.split(",");
// ['base', 'expenses', 'tasks', 'chat']

const ALL_MENU_ITEMS = [
  {
    title: "Record Sheets",
    to: "/",
    icon: "list",
    requiresAuth: true,
    module: "expenses",
  },
  {
    title: "Tasks",
    to: "/tasks",
    icon: "check_circle",
    requiresAuth: true,
    module: "tasks",
  },
  {
    title: "About",
    to: "/about",
    icon: "info",
    requiresAuth: false,
    module: "base",
  },
  {
    title: "Settings",
    to: "/settings",
    icon: "settings",
    requiresAuth: true,
    module: "base",
  },
];

const MENU_ITEMS = ALL_MENU_ITEMS.filter((item) => {
  return modulesToLoad.includes(item.module);
});

export default MENU_ITEMS;
