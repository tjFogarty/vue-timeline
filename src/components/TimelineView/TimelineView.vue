<template>
  <div class="timeline-container" ref="container">
    <div class="timeline">
      <ul class="resource-list">
        <li v-for="resource in resources" :key="resource.id" class="resource-item">
          <slot name="resource" v-bind="{ item: resource }">
          </slot>
        </li>
      </ul>
      <DatesHeader />

      <div v-for="weekend in weekendOccurences" :key="weekend.date.valueOf()" :style="`left: ${weekend.leftPos}px;`" class="weekend-indicator">
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import DatesHeader from './components/DatesHeader.vue';
import { provideTimeline } from './composables/useTimeline';

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
  width: v-bind(`${timelineWidth}px`);
}

.timeline *,
.timeline *:before,
.timeline *:after {
  box-sizing: border-box;
}

.resource-list {
  position: sticky;
  background-color: white;
  border-right: 1px solid #ccc;
  width: v-bind(`${props.resourceWidth}px`);
  left: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

.resource-item {
  height: v-bind(`${props.resourceHeight}px`);
}

.weekend-indicator {
  position: absolute;
  pointer-events: none;
  z-index: -1;
  top: 0;
  opacity: 0.2;
  height: 100%;
  background-color: #ccc;
  width: v-bind(`${columnWidth * 2}px`);
}
</style>