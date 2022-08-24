<template>
<li ref="el">
  <slot />
</li>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useMutationObserver } from '@vueuse/core';
import { useCurrentTimeline } from '../composables/useTimeline';

const props = defineProps({
  resourceId: {
    type: Number,
    required: true,
  }
})

const { setResourceTopPosition } = useCurrentTimeline();
const el = ref(null);

function saveTopPosition() {
  setResourceTopPosition(props.resourceId, el.value.offsetTop);
}

onMounted(() => {
  saveTopPosition();
  useMutationObserver(el, () => {
    saveTopPosition();
  }, { attributes: true });
})

</script>