<template>
  <div class="info">
    <button type="button" @click="goToToday">Go to today</button>
  </div>
  <div ref="container" class="timeline-container">
    <div ref="timelineEl" class="timeline" @click="handleTimelineClick">
      <div class="grid-bg"></div>

      <ResourceList>
        <template #resource="{ item }">
          <slot name="resource" v-bind="{ item }" />
        </template>
      </ResourceList>

      <MonthAndDayHeader />

      <WeekendIndicators />

      <!-- <EventItem v-for="event in events" :key="event.id" :data="event">
        <template #event="{ item }">
          <slot name="event" v-bind="{ item }" />
        </template>
      </EventItem> -->
      <ResourceTimeline v-for="resourceId in Object.keys(timelineStore.resourceTimelines)" :key="resourceId" :resource-id="resourceId" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useTimelineStore } from './store/useTimelineStore';
import { provideTimeline } from './composables/useTimeline';
import { provideMousePosition } from './composables/useMousePosition';
import MonthAndDayHeader from './components/MonthAndDayHeader.vue';
import ResourceList from './components/ResourceList.vue';
import WeekendIndicators from './components/WeekendIndicators.vue';
import { useTextDirection } from '@vueuse/core';
import EventItem from './components/EventItem.vue';
import ResourceTimeline from './components/ResourceTimeline.vue';

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
    projectWidth: props.projectWidth,
    rowHeight: props.rowHeight,
    headerHeight: props.headerHeight,
    textDir: textDir.value
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

const { hoveredDate, hoveredResourceId } = provideMousePosition({ container });

const timelineWidthPx = computed(() => {
  return `${timelineStore.timelineWidth}px`;
});

const timelineHeightPx = computed(() => {
  return `${
    props.visibleResources * props.rowHeight + props.headerHeight
  }px`;
});

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
  top: calc(v-bind(headerHeight) * 1px);
  inset-inline-start: calc(v-bind(resourceWidth) * 1px);
  background-size: calc(v-bind(columnWidth) * 1px);
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
  max-height: v-bind(timelineHeightPx);
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
