<template>
  <TimelineView
    :resources="resources"
    :events="tasks"
    :column-width="35"
    :row-height="40"
    @event-change="handleEventChange"
    @date-change="handleDateChange"
    @visible-date-change="visibleDateChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import { DateTime } from 'luxon';
import TimelineView from './TimelineView/TimelineView.vue';
import { DATE_FORMAT } from './TimelineView/constants';

const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(i + 97).toUpperCase(),
);
const resources = ref(
  Array.from({ length: 8 }).map((_, index) => {
    const name = `Project ${alphabet[index]}`;
    return { id: index + 1, name };
  }),
);

const tasks = ref(
  resources.value.flatMap((resource) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const startDate = DateTime.now().plus({
        days: Math.floor(Math.random() * 10) + 1,
      });
      const days = Math.floor(Math.random() * 25) + 1;
      const endDate = startDate.plus({ days });

      return {
        id: `${resource.id}-${i + 1}`,
        name: `Task ${resource.name} ${i + 1}`,
        startDate: startDate.toFormat(DATE_FORMAT),
        endDate: endDate.toFormat(DATE_FORMAT),
        resourceId: resource.id,
      };
    });
  }),
);

function handleEventChange(event) {
  console.log('Event Changed', event);
}

function handleDateChange(dates) {
  console.log('Dates Changed', dates);
}

function visibleDateChange(data) {
  console.log('Scrolling', data);
}
</script>
