import { shallowRef, computed, inject, provide } from 'vue';
import { useThrottleFn, useEventListener } from '@vueuse/core';
import useTimelineStore from '../store';

/**
  * @typedef {Object} MousePosition
  * @property {Ref<null|Date>} hoveredDate
  * @property {Ref<null|String>} hoveredResourceId
*/
function useMousePosition({ container }) {
  const timelineStore = useTimelineStore();
  const hoveredResourceId = shallowRef(null);
  const hoveredDate = shallowRef(null);

  function handleMouseMove(e) {
    const rect = container.value.getBoundingClientRect();
    const x = e.pageX + container.value.scrollLeft - rect.left;
    const y =
      e.pageY +
      container.value.scrollTop -
      rect.top -
      timelineStore.headerHeight;
    const topPos = y - (y % timelineStore.rowHeight);
    const resourceIndex = topPos / timelineStore.rowHeight;
    const dateIndex = Math.floor(
      (x - timelineStore.resourceWidth) / timelineStore.columnWidth,
    );

    hoveredResourceId.value = timelineStore.resources[resourceIndex]?.id;
    hoveredDate.value = timelineStore.dates[dateIndex];
  }

  const throttledHandleMouseMove = useThrottleFn(handleMouseMove, 100);

  useEventListener(container, 'mousemove', throttledHandleMouseMove);

  return {
    hoveredDate: computed(() => hoveredDate.value),
    hoveredResourceId: computed(() => hoveredResourceId.value),
    isDraggingEvent: shallowRef(null),
  };
}

let currentMousePosition;
const symbol = Symbol('useMousePosition');

export function provideMousePosition(opts) {
  currentMousePosition = useMousePosition(opts);
  provide(symbol, currentMousePosition);
  return currentMousePosition;
}

export function useCurrentMousePosition() {
  return inject(symbol);
}
