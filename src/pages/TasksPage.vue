<template>
  <q-page>
    <div class="q-pa-md">
      <q-card>
        <q-list separator>
          <q-item clickable @click="openNewTaskDialog">
            <q-item-section avatar>
              <q-icon name="add" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>New Task</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable @click="openShareListDialog">
            <q-item-section avatar>
              <q-icon name="share" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Share List</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <q-card square>
      <q-list separator>
        <q-item
          v-for="task in tasks"
          :key="task.id"
          clickable
          tag="label"
          v-ripple
          @click="toggleTaskStatus(task)"
        >
          <q-item-section avatar>
            <q-checkbox v-model="task.is_done" disable></q-checkbox>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ task.description }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script>
import { onMounted, computed, onUnmounted } from "vue";

import { useTaskStore } from "src/stores/task";
import { useGeneralStore } from "src/stores/general";

import { useQuasar } from "quasar";

export default {
  name: "TasksPage",

  setup() {
    const taskStore = useTaskStore();
    const generalStore = useGeneralStore();

    const $q = useQuasar();

    generalStore.show_add_record = false;

    const tasks = computed(() => taskStore.tasks);

    onMounted(async () => {
      await taskStore.fetch_tasklists();
      await taskStore.fetch_tasks();
      taskStore.subscribe_to_tasklist_updates();
    });

    onUnmounted(() => {
      taskStore.unsubscribe_from_tasklist_updates();
    });

    const openNewTaskDialog = () => {
      $q.dialog({
        title: "New Task",
        message: "Enter the task description",
        prompt: {
          model: "",
          isValid: (val) => val.length > 0,
        },
        cancel: true,
        persistent: true,
        ok: {
          label: "Save",
          color: "primary",
        },
      }).onOk(async (data) => {
        const newTask = {
          description: data,
        };
        await taskStore.create_task(newTask);
      });
    };

    const openShareListDialog = () => {
      $q.dialog({
        title: "Share List",
        message: "Enter the email of the user you want to share the list with",
        prompt: {
          model: "",
          isValid: (val) => val.length > 0,
        },
        cancel: true,
        persistent: true,
        ok: {
          label: "Save",
          color: "primary",
        },
      }).onOk(async (data) => {
        await taskStore.share_tasklist(data);
      });
    };

    const toggleTaskStatus = async (task) => {
      task.is_done = !task.is_done;
      task.done_at = task.is_done ? new Date() : null;
      await taskStore.update_task(task);
    };

    return {
      tasks,

      openNewTaskDialog,
      openShareListDialog,
      toggleTaskStatus,
    };
  },
};
</script>
