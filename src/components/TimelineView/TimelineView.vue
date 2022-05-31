<template>
  <div class="timeline-container" ref="container">
    <div class="timeline">
      <Resources>
        <template #resource="{ item }">
          <slot name="resource" v-bind="{ item }" />
        </template>
      </Resources>
      
      <DatesHeader />
      
      <WeekendIndicators />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DatesHeader from './components/DatesHeader.vue';
import Resources from './components/Resources.vue';
import { provideTimeline } from './composables/useTimeline';
import WeekendIndicators from './components/WeekendIndicators.vue';

const props = defineProps({
  resources: {
    type: Array,
    required: true,
  },
  events: {
    type: Array,
    default: () => ([]),
  },
  columnWidth: {
    type: Number,
    default: 80,
  },
  resourceWidth: {
    type: Number,
    default: 200,
  },
  resourceHeight: {
    type: Number,
    default: 80,
  }
})

const { timelineWidth, container, weekendOccurences } = provideTimeline({
  resources: props.resources,
  events: props.events,
  columnWidth: props.columnWidth, 
  resourceWidth: props.resourceWidth, 
  resourceHeight: props.resourceHeight
});

const timelineWidthPx = computed(() => {
  return `${timelineWidth.value}px`;
})
</script>

<style scoped>
.timeline-container {
  width: 100%;
  position: relative;
  overflow: auto;
}

.timeline {
  display: flex;
  font-family: sans-serif;
  width: v-bind(timelineWidthPx);
}

.timeline *,
.timeline *:before,
.timeline *:after {
  box-sizing: border-box;
}
</style>