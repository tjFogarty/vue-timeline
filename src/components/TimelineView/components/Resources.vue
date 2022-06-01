<template>
  <div class="resources">
    <div class="resource-header">
      Resources
    </div>
    <ul class="resource-list">
      <li v-for="resource in resources" :key="resource.id" class="resource-item">
        <slot name="resource" v-bind="{ item: resource }" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCurrentTimeline } from '../composables/useTimeline';

const { resources, resourceWidth, resourceHeight, headerHeight } = useCurrentTimeline();

const resourceWidthPx = computed(() => {
  return `${resourceWidth}px`;
});
const resourceHeightPx = computed(() => {
  return `${resourceHeight}px`;
});
const headerHeightPx = computed(() => {
  return `${headerHeight}px`;
});
</script>

<style scoped>
.resources {
  position: sticky;
  left: 0;
  z-index: 2;
  width: v-bind(resourceWidthPx);
  background-color: white;
  border-right: 1px solid #ccc;
}

.resource-header {
  position: sticky;
  top: 0;
  background-color: white;
  display: flex;
  align-items: center;
  width: 100%;
  height: v-bind(headerHeightPx);
}

.resource-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.resource-item {
  height: v-bind(resourceHeightPx);
}
</style>