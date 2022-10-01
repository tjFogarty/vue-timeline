import {
  onMounted,
  onUnmounted,
  nextTick,
  computed,
  provide,
  shallowRef,
  inject,
} from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { DateTime } from 'luxon';

const today = new Date();
const startOfLastMonth = new DateTime(today)
  .minus({ month: 1 })
  .startOf('month');
const endOfNextMonth = new DateTime(today).plus({ month: 1 }).endOf('month');

export default function useTimeline({
  resources,
  events,
  columnWidth,
  resourceWidth,
  resourceHeight,
  headerHeight,
}) {
  const container = shallowRef(null);
  const scrollLeft = shallowRef(0);
  const isMovingForwards = shallowRef(false);
  const isMovingBackwards = shallowRef(false);
  const hoveredResourceId = shallowRef(null);
  const hoveredDate = shallowRef(null);
  const startDate = shallowRef(startOfLastMonth);
  const endDate = shallowRef(endOfNextMonth);
  const dates = computed(() => {
    let start = new DateTime(startDate.value);
    const dates = [];

    while (start <= endDate.value) {
      dates.push(start);
      start = start.plus({ day: 1 });
    }

    return dates;
  });
  const groupedDatesByMonth = computed(() => {
    const groupedDates = {};
    dates.value.forEach((date) => {
      const month = date.toFormat('MMMM y');
      if (!groupedDates[month]) {
        groupedDates[month] = [];
      }
      groupedDates[month].push(date);
    });
    return groupedDates;
  });
  const datePositions = computed(() => {
    const positions = {};

    dates.value.forEach((date, index) => {
      positions[date.toFormat('y-MM-dd')] = index * columnWidth + resourceWidth;
    });

    return positions;
  });
  const timelineWidth = computed(() => {
    return dates.value.length * columnWidth + resourceWidth;
  });
  const weekendOccurences = computed(() => {
    let leftPos = resourceWidth;

    const weekends = dates.value
      .map((d) => {
        leftPos = leftPos + columnWidth;

        if (parseInt(d.toFormat('c'), 10) === 6) {
          return {
            date: d,
            leftPos: leftPos - columnWidth,
          };
        }

        return null;
      })
      .filter((d) => d !== null);

    return weekends;
  });
  const eventsGroupedByResource = computed(() => {
    const grouped = {};

    resources.forEach((r) => {
      const resourceEvents = events
        .filter((e) => e.resourceId === r.id)
        .sort((a, b) => {
          return a.startDate - b.startDate;
        });

      if (resourceEvents.length) {
        grouped[r.id] = resourceEvents;
      }
    });

    return grouped;
  });
  const overlaps = computed(() => {
    const overlaps = {};

    Object.keys(eventsGroupedByResource.value).forEach((resourceId) => {
      const events = eventsGroupedByResource.value[resourceId];
      let overlapCount = 1;
      overlaps[resourceId] = {};

      for (let i = 1; i < events.length; i++) {
        const eventA = events[i];
        const eventB = events[i - 1];

        overlaps[resourceId][eventA.id] = {};

        if (eventB.endDate > eventA.startDate) {
          overlapCount += 1;
          overlaps[resourceId][eventA.id].position = overlapCount;
        }
      }

      overlaps[resourceId].overlapCount = overlapCount;
    });

    return overlaps;
  });
  const eventPositions = computed(() => {
    const positions = {};
    events.forEach((event) => {
      const start = DateTime.fromFormat(event.startDate, 'y-MM-dd');
      const end = DateTime.fromFormat(event.endDate, 'y-MM-dd');

      if (start < startDate.value || end > endDate.value) {
        return;
      }

      const dateIndex = dates.value.findIndex((d) => d.hasSame(start, 'day'));

      if (dateIndex !== -1) {
        const overlapPosition =
          overlaps.value[event.resourceId][event.id]?.position || 1;
        const leftPos = datePositions.value[event.startDate];
        const { days } = end.diff(start, 'days').toObject();
        let topPos = resPos.value[event.resourceId].top;

        if (overlapPosition > 1) {
          topPos += (overlapPosition - 1) * resourceHeight;
        }

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
    const triggerArea = timelineWidth.value * 0.1;
    isMovingForwards.value = scrollLeftVal > scrollLeft.value;
    isMovingBackwards.value = scrollLeftVal < scrollLeft.value;
    scrollLeft.value = scrollLeftVal;

    // need to swap months in and out while preserving the scroll position
    if (isMovingForwards.value) {
      if (
        scrollLeftVal + event.target.offsetWidth >=
        timelineWidth.value - triggerArea
      ) {
        const previousStartMonthDayCount = startDate.value.endOf('month').c.day;

        startDate.value = startDate.value.plus({ month: 1 }).startOf('month');
        endDate.value = endDate.value.plus({ month: 1 }).endOf('month');

        const newScrollPosition =
          scrollLeft.value - previousStartMonthDayCount * columnWidth;

        nextTick(() => {
          container.value.scrollLeft = newScrollPosition;
        });
      }
    } else if (isMovingBackwards.value) {
      if (scrollLeftVal < triggerArea) {
        const previousEndMonthDayCount = endDate.value.endOf('month').c.day;

        startDate.value = startDate.value.minus({ month: 1 }).startOf('month');
        endDate.value = endDate.value.minus({ month: 1 }).endOf('month');

        const diff =
          previousEndMonthDayCount - startDate.value.endOf('month').c.day;
        const newScrollPosition =
          scrollLeft.value + (previousEndMonthDayCount - diff) * columnWidth;

        nextTick(() => {
          container.value.scrollLeft = newScrollPosition;
        });
      }
    }
  }

  const resPos = computed(() => {
    const heightPosMap = {};
    let totalHeight = headerHeight;
    resources.forEach((r) => {
      const overlapCount = overlaps.value[r.id]?.overlapCount || 1;
      const height = overlapCount * resourceHeight;

      totalHeight += height;

      heightPosMap[r.id] = {
        top: totalHeight - resourceHeight * overlapCount,
        height,
      };
    });

    return heightPosMap;
  });

  function goToToday(useSmoothScroll = true) {
    startDate.value = startOfLastMonth;
    endDate.value = endOfNextMonth;

    container.value.scrollTo({
      top: 0,
      left: todayPosition.value * columnWidth,
      behavior: useSmoothScroll ? 'smooth' : 'instant',
    });
  }

  const throttledHandleScroll = useThrottleFn(handleScroll, 100);

  function handleMouseMove(e) {
    const rect = container.value.getBoundingClientRect();
    const x = e.pageX + container.value.scrollLeft - rect.left;
    const y = e.pageY + container.value.scrollTop - rect.top - headerHeight;
    const topPos = y - (y % resourceHeight);
    const resourceIndex = topPos / resourceHeight;
    const dateIndex = Math.floor((x - resourceWidth) / columnWidth);

    hoveredResourceId.value = resources[resourceIndex]?.id;
    hoveredDate.value = dates.value[dateIndex];
  }

  const throttledHandleMouseMove = useThrottleFn(handleMouseMove, 100);

  // this will make the `dragend` listener fire immediately
  function handleDragOver(e) {
    e.preventDefault();
  }

  onMounted(() => {
    container.value.addEventListener('mousemove', throttledHandleMouseMove, {
      passive: true,
    });
    container.value.addEventListener('scroll', throttledHandleScroll, {
      passive: true,
    });
    container.value.addEventListener('dragover', handleDragOver);
    goToToday(false);
  });

  onUnmounted(() => {
    container.value.removeEventListener('mousemove', throttledHandleMouseMove);
    container.value.removeEventListener('scroll', throttledHandleScroll);
    container.value.removeEventListener('dragover', handleDragOver);
  });

  return {
    startDate,
    endDate,
    container,
    goToToday,
    resources,
    events,
    dates,
    groupedDatesByMonth,
    datePositions,
    weekendOccurences,
    eventPositions,
    timelineWidth,
    columnWidth,
    resourceWidth,
    resourceHeight,
    headerHeight,
    hoveredDate,
    hoveredResourceId,
    resPos,
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
