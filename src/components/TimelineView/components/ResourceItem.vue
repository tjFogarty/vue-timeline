<template>
  <li class="resource-item">
    <slot />
  </li>
</template>

<script setup>
import { useTimelineStore } from '../store/useTimelineStore';

const props = defineProps({
  resourceId: {
    type: Number,
    required: true,
  },
});

const timelineStore = useTimelineStore();
const { height } = timelineStore.resPos[props.resourceId];
</script>

<style scoped>
.resource-item {
  left: 0;
  height: calc(v-bind(height) * 1px);
}
</style>
