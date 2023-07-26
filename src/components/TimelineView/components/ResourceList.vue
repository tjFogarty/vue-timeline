<template>
  <div class="resources">
    <div class="resource-header">Projects</div>
    <ul class="resource-list">
      <ResourceItem
        v-for="resource in store.resources"
        :resource="resource"
        :key="resource.id"
      />
    </ul>
  </div>
</template>

<script setup>
import ResourceItem from './ResourceItem.vue';
import useTimelineStore from '../store';

const store = useTimelineStore();
</script>

<style scoped>
.resources {
  position: sticky;
  inset-inline-start: 0;
  top: 0;
  z-index: 2;
  width: var(--resource-width);
  background-color: white;
  border-inline-end: 1px solid #ccc;
}

.resource-header {
  position: sticky;
  display: flex;
  align-items: center;
  background-color: white;
  width: 100%;
  top: 0;
  z-index: 1;
  padding: 5px;
  height: var(--header-height);
}

.resource-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
