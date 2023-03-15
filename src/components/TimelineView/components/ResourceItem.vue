<template>
  <li class="resource-item">
    <slot />
  </li>
</template>

<script setup>
import { useTimelineStore } from '../store/useTimelineStore';

const { rowHeight, timelineWidth } = useTimelineStore();
</script>

<style scoped>
.resource-item {
  position: relative;
  inset-inline-start: 0;
  height: calc(v-bind(rowHeight) * 1px);
}

.resource-item:after {
  content: '';
  width: 100%;
  position: absolute;
  bottom: 0;
  height: 1px;
  width: calc(v-bind(timelineWidth) * 1px);
  background-color: rgba(0, 0, 0, 0.05);
  pointer-events: none;
}
</style>
