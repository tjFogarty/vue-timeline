<template>
  <div class="info">
    <button type="button" @click="goToToday">Go to today</button>
  </div>
  <div class="timeline-container" ref="container">
    <div class="timeline" @click="handleTimelineClick" ref="timelineEl">
      <div class="grid-bg"></div>

      <Resources>
        <template #resource="{ item }">
          <slot name="resource" v-bind="{ item }" />
        </template>
      </Resources>

      <DatesHeader />

      <WeekendIndicators />

      <Event v-for="event in events" :key="event.id" :data="event">
        <template #event="{ item }">
          <slot name="event" v-bind="{ item }" />
        </template>
      </Event>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { provideTimeline } from './composables/useTimeline';
import DatesHeader from './components/DatesHeader.vue';
import Resources from './components/Resources.vue';
import WeekendIndicators from './components/WeekendIndicators.vue';
import Event from './components/Event.vue';

const props = defineProps({
  resources: {
    type: Array,
    required: true,
  },
  visibleResources: {
    type: Number,
    default: 10,
  },
  events: {
    type: Array,
    default: () => ([]),
  },
  columnWidth: {
    type: Number,
    default: 120,
  },
  resourceWidth: {
    type: Number,
    default: 200,
  },
  resourceHeight: {
    type: Number,
    default: 50,
  },
  headerHeight: {
    type: Number,
    default: 80,
  }
});

const timelineEl = ref(null);

const emit = defineEmits(['create-event', 'date-change']);

const { timelineWidth, container, goToToday, hoveredResourceId, hoveredDate, startDate, endDate } = provideTimeline({
  resources: props.resources,
  events: props.events,
  columnWidth: props.columnWidth,
  resourceWidth: props.resourceWidth,
  resourceHeight: props.resourceHeight,
  headerHeight: props.headerHeight,
});

const timelineWidthPx = computed(() => {
  return `${timelineWidth.value}px`;
})

const timelineHeightPx = computed(() => {
  return `${props.visibleResources * props.resourceHeight + props.headerHeight}px`;
});

watch([startDate, endDate], ([newStart, newEnd]) => {
  emit('date-change', {
    startDate: newStart,
    endDate: newEnd,
  });
});

function handleTimelineClick(e) {
  if (e.target !== timelineEl.value) return;

  emit('create-event', {
    startDate: hoveredDate.value,
    endDate: hoveredDate.value,
    resourceId: hoveredResourceId.value,
  });
}
</script>

<style scoped>
.info {
  font-family: sans-serif;
  text-align: center;
}

.grid-bg {
  position: absolute;
  top: calc(v-bind(headerHeight) * 1px);
  left: calc(v-bind(resourceWidth) * 1px);
  background-size: calc(v-bind(columnWidth) * 1px);
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.timeline-container {
  width: 100%;
  overflow: auto;
  border: 1px solid #ccc;
  height: v-bind(timelineHeightPx);
}

.timeline {
  display: flex;
  position: relative;
  font-family: sans-serif;
  width: v-bind(timelineWidthPx);
}
</style>

<style>
.timeline *,
.timeline *:before,
.timeline *:after {
  box-sizing: border-box;
}
</style>