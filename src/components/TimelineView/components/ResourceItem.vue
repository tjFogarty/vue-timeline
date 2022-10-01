<template>
  <li class="resource-item">
    <slot />
  </li>
</template>

<script setup>
import { useCurrentTimeline } from '../composables/useTimeline';

const props = defineProps({
  resourceId: {
    type: Number,
    required: true,
  },
});

const { resPos } = useCurrentTimeline();
const { height } = resPos.value[props.resourceId];
</script>

<style scoped>
.resource-item {
  left: 0;
  height: calc(v-bind(height) * 1px);
}
</style>
