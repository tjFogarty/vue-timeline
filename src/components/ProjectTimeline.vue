<template>
  <TimelineView :resources="resources" :events="tasks" :column-width="35">
    <template #resource="{ item }">
      <div class="custom-resource">{{ item.name }}</div>
    </template>
  </TimelineView>
</template>

<script setup>
import { ref } from 'vue';
import { DateTime } from 'luxon';
import TimelineView from './TimelineView/TimelineView.vue';

const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(i + 97).toUpperCase(),
);
const resources = ref(
  Array.from({ length: 8 }).map((_, i) => {
    return {
      id: i + 1,
      name: `Project ${alphabet[i]}`,
    };
  }),
);
const today = new Date();
const tasks = ref(
  resources.value.flatMap((resource) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const startDate = new DateTime(today)
        .plus({ days: Math.floor(Math.random() * 10) + 1 })
        .toFormat('y-MM-dd');
      const days = Math.floor(Math.random() * 25) + 1;
      const endDate = new DateTime(startDate)
        .plus({ days })
        .toFormat('y-MM-dd');

      return {
        id: `${resource.id}-${i + 1}`,
        name: `Task ${i + 1}`,
        startDate,
        endDate,
        resourceId: resource.id,
      };
    });
  }),
);
</script>

<style scoped>
.custom-event {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: 5px;
}

.custom-event.task {
  background-color: #3ea1ff;
  color: white;
}

.custom-event.event {
  background-color: #ff8686;
  color: white;
}

.custom-resource {
  display: flex;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid #ccc;
  height: 100%;
}
</style>
