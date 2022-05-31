import { onMounted, onUnmounted, ref, computed, provide, inject } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { DateTime } from 'luxon';

const today = new Date();
const startOfLastMonth = new DateTime(today).minus({ month: 1 }).startOf('month');
const endOfNextMonth = new DateTime(today).plus({ month: 1 }).endOf('month');

export default function useTimeline({ resources, events, columnWidth, resourceWidth, resourceHeight }) {
  const container = ref(null);
  const scrollLeft = ref(0);
  const isMovingForwards = ref(false);
  const isMovingBackwards = ref(false);
  const startDate = ref(startOfLastMonth);
  const endDate = ref(endOfNextMonth);
  const dates = computed(() => {
    let start = new DateTime(startDate.value);
    const dates = [];

    while (start <= endDate.value) {
      dates.push(start);
      start = start.plus({ day: 1 });
    }

    return dates;
  });
  const timelineWidth = computed(() => {
    return (dates.value.length * columnWidth) + resourceWidth;
  });
  const weekendOccurences = computed(() => {
    let leftPos = resourceWidth;

    return dates.value.map((d) => {
      leftPos = leftPos + columnWidth;

      if (parseInt(d.toFormat('c'), 10) === 6) {
        return {
          date: d,
          leftPos: leftPos - columnWidth,
        };
      }

      return null;
    }).filter((d) => d !== null);
  });

  function handleScroll(event) {
    const scrollLeftVal = event.target.scrollLeft;
    isMovingForwards.value = scrollLeftVal > scrollLeft.value;
    isMovingBackwards.value = scrollLeftVal < scrollLeft.value;
    scrollLeft.value = scrollLeftVal;

    // need to swap months in and out while preserving the scroll position
    if (scrollLeftVal + event.target.offsetWidth >= timelineWidth.value - 500 && isMovingForwards.value) {
      // startDate.value = startDate.value.plus({ month: 1 });
      // endDate.value = endDate.value.plus({ month: 1 });
    } else if (scrollLeftVal < 500 && isMovingBackwards.value) {
      // startDate.value = startDate.value.minus({ month: 1 });
      // endDate.value = endDate.value.minus({ month: 1 });
    }
  }

  const throttledHandleScroll = useThrottleFn(handleScroll, 100);

  onMounted(() => {
    container.value.addEventListener('scroll', throttledHandleScroll);
  });

  onUnmounted(() => {
    container.value.removeEventListener('scroll', throttledHandleScroll);
  });

  return {
    container,
    resources,
    events,
    dates,
    timelineWidth,
    columnWidth,
    resourceWidth,
    resourceHeight,
    weekendOccurences,
  };
}

let currentTimeline = null;
const symbol = Symbol('useTimeline');

export function provideTimeline(opts) {
  currentTimeline = useTimeline(opts);
  provide(symbol, currentTimeline);
  return currentTimeline;
}

export function useCurrentTimeline() {
  return inject(symbol);
}

