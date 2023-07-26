<template>
  <div class="info">
    <button type="button" @click="goToToday">Go to today</button>
  </div>
  <div
    ref="container"
    class="timeline-container"
    :style="timelineStore.cssVars"
  >
    <div
      ref="timelineEl"
      class="timeline teej-timeline"
      :class="{ 'is-dragging-event': isDraggingEvent }"
      @click="handleTimelineClick"
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

const emit = defineEmits(['create-event', 'date-change']);

const { container, goToToday } = provideTimeline();

const { hoveredDate, hoveredResourceId, isDraggingEvent } =
  provideMousePosition({ container });

watch(
  [timelineStore.startDate, timelineStore.endDate],
  ([newStart, newEnd]) => {
    emit('date-change', {
      startDate: newStart,
      endDate: newEnd,
    });
  },
);

onMounted(() => {
  goToToday();
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
  top: var(--header-height);
  inset-inline-start: var(--resource-width);
  background-size: var(--column-width);
  background-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.05) 1px,
    transparent 1px
  );
  width: 100%;
  pointer-events: none;
}

.timeline-container {
  width: 100%;
  overflow: auto;
  border: 1px solid #ccc;
  max-height: 600px;
}

.timeline {
  display: flex;
  position: relative;
  font-family: sans-serif;
  width: var(--timeline-width);
  /* height: var(--timeline-height); */
  height: 100%;
}

.is-dragging-event {
  cursor: grabbing;
}
</style>

<style>
.teej-timeline *,
.teej-timeline *:before,
.teej-timeline *:after {
  box-sizing: border-box;
}
</style>
