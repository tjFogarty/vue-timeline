<template>
  <div class="resources">
    <div class="resource-header">Resources</div>
    <ul class="resource-list">
      <ResourceItem
        v-for="resource in resources"
        :key="resource.id"
      >
        <slot name="resource" v-bind="{ item: resource }" />
      </ResourceItem>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import ResourceItem from './ResourceItem.vue';
import { useTimelineStore } from '../store/useTimelineStore';

const { resources, resourceWidth, headerHeight } = useTimelineStore();

const resourceWidthPx = computed(() => {
  return `${resourceWidth}px`;
});
const headerHeightPx = computed(() => {
  return `${headerHeight}px`;
});
</script>

<style scoped>
.resources {
  position: sticky;
  inset-inline-start: 0;
  z-index: 2;
  width: v-bind(resourceWidthPx);
  background-color: white;
  border-inline-end: 1px solid #ccc;
}

.resource-header {
  position: sticky;
  top: 0;
  background-color: white;
  display: flex;
  align-items: center;
  width: 100%;
  z-index: 1;
  height: v-bind(headerHeightPx);
}

.resource-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
