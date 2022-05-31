<template>
  <ul class="resource-list">
    <li v-for="resource in resources" :key="resource.id" class="resource-item">
      <slot name="resource" v-bind="{ item: resource }" />
    </li>
  </ul>
</template>

<script setup>
import { computed } from 'vue';
import { useCurrentTimeline } from '../composables/useTimeline';

const { resources, resourceWidth, resourceHeight } = useCurrentTimeline();

const resourceWidthPx = computed(() =>{
  return `${resourceWidth}px`;
});
const resourceHeightPx = computed(() => {
  return `${resourceHeight}px`;
});
</script>

<style scoped>
.resource-list {
  position: sticky;
  background-color: white;
  border-right: 1px solid #ccc;
  width: v-bind(resourceWidthPx);
  left: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

.resource-item {
  height: v-bind(resourceHeightPx);
}
</style>