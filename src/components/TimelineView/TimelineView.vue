<template>
  <div class="info">
    <button type="button" @click="goToToday" aria-label="Navigate to today's date on timeline">Go to today</button>
  </div>
  <div
    ref="container"
    class="timeline-container"
    role="application"
    aria-label="Interactive project timeline"
    :style="timelineStore.cssVars"
    tabindex="0"
    @keydown="handleTimelineKeyDown"
  >
    <div
      ref="timelineEl"
      class="timeline teej-timeline"
      :class="{ 'is-dragging-event': isDraggingEvent }"
      role="grid"
      :aria-colcount="timelineStore.dates.length"
      :aria-rowcount="timelineStore.resources.length"
    >
      <div class="grid-bg"></div>

      <ResourceList />

      <MonthAndDayHeader />

      <WeekendIndicators />

      <ResourceTimeline
        v-for="resourceId in Object.keys(timelineStore.resourceTimelines)"
        :key="resourceId"
        :resource-id="resourceId"
      />

      <EventTimeline
        v-for="event in timelineStore.visibleEventTimelines"
        :key="event.id"
        :data="event"
        @event-change="() => handleEventChange(event)"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useTextDirection } from '@vueuse/core';
import useTimelineStore from './store';
import { provideTimeline } from './composables/useTimeline';
import { provideMousePosition } from './composables/useMousePosition';
import MonthAndDayHeader from './components/MonthAndDayHeader.vue';
import ResourceList from './components/ResourceList.vue';
import WeekendIndicators from './components/WeekendIndicators.vue';
import ResourceTimeline from './components/ResourceTimeline.vue';
import EventTimeline from './components/EventTimeline.vue';

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
    default: () => [],
  },
  columnWidth: {
    type: Number,
    default: 120,
  },
  resourceWidth: {
    type: Number,
    default: 200,
  },
  rowHeight: {
    type: Number,
    default: 50,
  },
  headerHeight: {
    type: Number,
    default: 80,
  },
});

const textDir = useTextDirection();
const timelineStore = useTimelineStore();
const timelineEl = ref(null);

timelineStore.$reset();

function setConfig() {
  timelineStore.setConfig({
    columnWidth: props.columnWidth,
    resourceWidth: props.resourceWidth,
    rowHeight: props.rowHeight,
    headerHeight: props.headerHeight,
    textDir: textDir.value,
  });
}

timelineStore.addResources(props.resources);
timelineStore.addEvents(props.events);

watch(
  [
    () => props.columnWidth,
    () => props.resourceWidth,
    () => props.rowHeight,
    () => props.headerHeight,
  ],
  setConfig,
  { immediate: true },
);

const emit = defineEmits([
  'event-change',
  'date-change',
  'visible-date-change',
]);

const { container, goToToday } = provideTimeline();

const { isDraggingEvent } = provideMousePosition({ container });

watch(
  () => [timelineStore.startDate, timelineStore.endDate],
  ([newStart, newEnd]) => {
    emit('date-change', {
      startDate: newStart,
      endDate: newEnd,
    });
  },
);

watch(
  () => [timelineStore.visibleStartDate, timelineStore.visibleEndDate],
  ([visibleStart, visibleEnd]) => {
    emit('visible-date-change', {
      startDate: visibleStart,
      endDate: visibleEnd,
    });
  },
);

onMounted(() => {
  goToToday();
});

function handleEventChange(event) {
  emit('event-change', event);
}

function handleTimelineKeyDown(event) {
  switch (event.key) {
    case 'Home':
      event.preventDefault();
      goToToday();
      break;
    case 'ArrowLeft':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        // Scroll timeline left
        container.value.scrollLeft = Math.max(0, container.value.scrollLeft - timelineStore.columnWidth * 7);
      }
      break;
    case 'ArrowRight':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        // Scroll timeline right
        container.value.scrollLeft += timelineStore.columnWidth * 7;
      }
      break;
  }
}
</script>

<style scoped>
.info {
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.info button {
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.info button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.grid-bg {
  position: absolute;
  top: var(--header-height);
  inset-inline-start: var(--resource-width);
  background-size: var(--column-width);
  background-image: linear-gradient(
    to right,
    #e5e7eb 1px,
    transparent 1px
  );
  width: calc(100% - var(--resource-width));
  height: calc(var(--timeline-height) - var(--header-height));
  pointer-events: none;
}

.timeline-container {
  width: 100%;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  max-height: 600px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background: #ffffff;
}

.timeline {
  display: flex;
  position: relative;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
  width: var(--timeline-width);
  height: var(--timeline-height);
  background: #ffffff;
}

.is-dragging-event {
  cursor: grabbing;
}

.timeline-container::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.timeline-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 6px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 6px;
  border: 2px solid #f3f4f6;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.timeline-container::-webkit-scrollbar-corner {
  background: #f3f4f6;
}
</style>

<style>
.teej-timeline *,
.teej-timeline *:before,
.teej-timeline *:after {
  box-sizing: border-box;
}
</style>
