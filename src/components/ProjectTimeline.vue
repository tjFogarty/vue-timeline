<template>
  <TimelineView
    :resources="resources"
    :events="tasks"
    :column-width="35"
    :row-height="40"
    @event-change="handleEventChange"
    @date-change="handleDateChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import { DateTime } from 'luxon';
import TimelineView from './TimelineView/TimelineView.vue';
import { DATE_FORMAT } from './TimelineView/constants';

// generate an array of colours that would be readable with white text
const colours = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#9e9e9e',
  '#607d8b',
];

const getRandomColour = () => {
  const index = Math.floor(Math.random() * colours.length);
  return colours[index];
};

const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(i + 97).toUpperCase(),
);
const resources = ref(
  Array.from({ length: 8 }).map((_, index) => {
    const name = `Project ${alphabet[index]}`;
    const colour = getRandomColour();
    return { id: index + 1, name, colour };
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
</script>
