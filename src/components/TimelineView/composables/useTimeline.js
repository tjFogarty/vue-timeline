import { onMounted, onUnmounted, ref, computed, nextTick, provide, inject } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { DateTime } from 'luxon';

const today = new Date();
const startOfLastMonth = new DateTime(today).minus({ month: 1 }).startOf('month');
const endOfNextMonth = new DateTime(today).plus({ month: 1 }).endOf('month');

export default function useTimeline({
  resources, 
  events, 
  columnWidth, 
  resourceWidth, 
  resourceHeight,
  headerHeight,
}) {
  const container = ref(null);
  const scrollLeft = ref(0);
  const isMovingForwards = ref(false);
  const isMovingBackwards = ref(false);
  const mousePosition = ref({ x: 0, y: 0 });
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
  const eventPositions = computed(() => {
    const positions = {};
    events.forEach((event) => {
      // find left pos based on date
      const start = DateTime.fromFormat(event.startDate, 'y-MM-dd');
      const end = DateTime.fromFormat(event.endDate, 'y-MM-dd');
      const dateIndex = dates.value.findIndex((d) => d.hasSame(start, 'day'));

      if (dateIndex !== -1) {
        const leftPos = (dateIndex * columnWidth) + resourceWidth;
        const resourceIndex = resources.findIndex((r) => r.id === event.resourceId);
        const topPos = headerHeight + (resourceIndex * resourceHeight);
        const { days } = end.diff(start, 'days').toObject();

        positions[event.id] = {
          left: leftPos,
          top: topPos,
          width: (days + 1) * columnWidth,
        };
      }
    });

    return positions;
  });
  const todayPosition = computed(() => {
    const now = new DateTime(today);

    return dates.value.findIndex((d) => {
      return d.hasSame(now, 'day');
    });
  });

  function handleScroll(event) {
    const scrollLeftVal = event.target.scrollLeft;
    isMovingForwards.value = scrollLeftVal > scrollLeft.value;
    isMovingBackwards.value = scrollLeftVal < scrollLeft.value;
    scrollLeft.value = scrollLeftVal;

    // need to swap months in and out while preserving the scroll position
    if (isMovingForwards.value) {
      if (scrollLeftVal + event.target.offsetWidth >= timelineWidth.value - 500) {
        const previousStartMonthDayCount = daysInMonthCount(startDate.value.toJSDate());
        
        startDate.value = startDate.value.plus({ month: 1 });
        endDate.value = endDate.value.plus({ month: 1 });

        container.value.scrollLeft = scrollLeft.value - (previousStartMonthDayCount * columnWidth);
      }
    } else if (isMovingBackwards.value) {
      if (scrollLeftVal < 500) {
        const previousEndMonthDayCount = daysInMonthCount(endDate.value.toJSDate());

        startDate.value = startDate.value.minus({ month: 1 });
        endDate.value = endDate.value.minus({ month: 1 });

        container.value.scrollLeft = scrollLeft.value + (previousEndMonthDayCount * columnWidth) - columnWidth;
      }
    }
  }

  function goToToday() {
    startDate.value = startOfLastMonth;
    endDate.value = endOfNextMonth;
    container.value.scrollLeft = todayPosition.value * columnWidth;
  }

  const throttledHandleScroll = useThrottleFn(handleScroll, 100);

  function daysInMonthCount(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function handleMouseMove(e) {
    const rect = container.value.getBoundingClientRect();
    const x = e.pageX + container.value.scrollLeft - rect.left;
    const y = e.pageY + container.value.scrollTop - rect.top;
    const topPos = y - (y % resourceHeight);
    const resourceIndex = (topPos / resourceHeight) - 1;
    const dateIndex = Math.floor(((x - resourceWidth) / columnWidth));

    console.log(resources[resourceIndex]?.name || 'Not on a resource', dates.value[dateIndex].toFormat('y-MM-dd'));
  }

  onMounted(() => {
    container.value.addEventListener('mousemove', handleMouseMove);
    container.value.addEventListener('scroll', throttledHandleScroll);
    goToToday();
  });

  onUnmounted(() => {
    container.value.removeEventListener('mousemove', handleMouseMove);
    container.value.removeEventListener('scroll', throttledHandleScroll);
  });

  return {
    startDate,
    endDate,
    container,
    goToToday,
    resources,
    events,
    dates,
    weekendOccurences,
    eventPositions,
    timelineWidth,
    columnWidth,
    resourceWidth,
    resourceHeight,
    headerHeight,
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

