<template>
  <div class="info">
    <p>Visible Dates: <strong>{{ startDate.toFormat('y-MM-dd') }} - {{ endDate.toFormat('y-MM-dd') }}</strong></p>
    <p>
      Mouse position: <strong>{{ hoveredDate && hoveredDate.toFormat('yy-MM-dd') }}
      {{ hoveredResourceId && `over resource id ${hoveredResourceId}` }}
      </strong>
    </p>
    <button type="button" @click="goToToday">Go to today</button>
  </div>
  <div class="timeline-container" ref="container">
    <div class="timeline">
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
import { computed } from 'vue';
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
    default: 80,
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
    default: 50,
  }
})

const { timelineWidth, container, startDate, endDate, goToToday, hoveredDate, hoveredResourceId } = provideTimeline({
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
</script>

<style scoped>
.info {
  font-family: sans-serif;
  text-align: center;
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