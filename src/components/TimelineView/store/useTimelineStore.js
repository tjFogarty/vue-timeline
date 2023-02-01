import { defineStore } from 'pinia';
import { DateTime } from 'luxon';

const today = new Date();
const startOfLastMonth = new DateTime(today)
  .minus({ month: 1 })
  .startOf('month');
const endOfNextMonth = new DateTime(today).plus({ month: 1 }).endOf('month');

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    events: [],
    resources: [],
    columnWidth: 120,
    resourceWidth: 200,
    resourceHeight: 50,
    headerHeight: 80,
    startDate: startOfLastMonth,
    endDate: endOfNextMonth,
  }),
  getters: {
    dates() {
      let start = new DateTime(this.startDate);
      const dates = [];

      while (start <= this.endDate) {
        dates.push(start);
        start = start.plus({ day: 1 });
      }

      return dates;
    },

    groupedDatesByMonth() {
      const groupedDates = {};
      this.dates.forEach((date) => {
        const month = date.toFormat('MMMM y');
        if (!groupedDates[month]) {
          groupedDates[month] = [];
        }
        groupedDates[month].push(date);
      });
      return groupedDates;
    },

    datePositions() {
      const positions = {};

      this.dates.forEach((date, index) => {
        positions[date.toFormat('y-MM-dd')] =
          index * this.columnWidth + this.resourceWidth;
      });

      return positions;
    },

    timelineWidth() {
      return this.dates.length * this.columnWidth + this.resourceWidth;
    },

    weekendOccurences() {
      let leftPos = this.resourceWidth;

      const weekends = this.dates
        .map((d) => {
          leftPos = leftPos + this.columnWidth;

          if (parseInt(d.toFormat('c'), 10) === 6) {
            return {
              date: d,
              leftPos: leftPos - this.columnWidth,
            };
          }

          return null;
        })
        .filter((d) => d !== null);

      return weekends;
    },

    eventsGroupedByResource() {
      const grouped = {};

      this.resources.forEach((r) => {
        const resourceEvents = this.events
          .filter((e) => e.resourceId === r.id)
          .sort((a, b) => {
            return a.startDate - b.startDate;
          });

        if (resourceEvents.length) {
          grouped[r.id] = resourceEvents;
        }
      });

      return grouped;
    },

    overlaps() {
      const overlaps = {};

      Object.keys(this.eventsGroupedByResource).forEach((resourceId) => {
        const events = this.eventsGroupedByResource[resourceId];
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
    },

    height() {
      let totalHeight = 0;

      this.resources.forEach((resource) => {
        const overlapCount = this.overlaps[resource.id]?.overlapCount || 1;
        totalHeight += overlapCount * this.resourceHeight;
      });

      return totalHeight;
    },

    resPos() {
      const heightPosMap = {};
      let totalHeight = this.headerHeight;
      this.resources.forEach((r) => {
        const overlapCount = this.overlaps[r.id]?.overlapCount || 1;
        const height = overlapCount * this.resourceHeight;

        totalHeight += height;

        heightPosMap[r.id] = {
          top: totalHeight - this.resourceHeight * overlapCount,
          height,
        };
      });

      return heightPosMap;
    },

    eventPositions() {
      const positions = {};
      this.events.forEach((event) => {
        const start = DateTime.fromFormat(event.startDate, 'y-MM-dd');
        const end = DateTime.fromFormat(event.endDate, 'y-MM-dd');

        if (start < this.startDate || end > this.endDate) {
          return;
        }

        const dateIndex = this.dates.findIndex((d) => d.hasSame(start, 'day'));

        if (dateIndex !== -1) {
          const overlapPosition =
            this.overlaps[event.resourceId][event.id]?.position || 1;
          const leftPos = this.datePositions[event.startDate];
          const { days } = end.diff(start, 'days').toObject();
          let topPos = this.resPos[event.resourceId].top;

          if (overlapPosition > 1) {
            topPos += (overlapPosition - 1) * this.resourceHeight;
          }

          positions[event.id] = {
            left: leftPos,
            top: topPos,
            width: (days + 1) * this.columnWidth,
          };
        }
      });

      return positions;
    },

    todayPosition() {
      const now = new DateTime(today);

      return this.dates.findIndex((d) => {
        return d.hasSame(now, 'day');
      });
    },
  },
  actions: {
    addEvents(events) {
      this.events = [...this.events, ...events];
    },

    addEvent(event) {
      this.events.push(event);
    },

    addResources(resources) {
      this.resources = [...this.resources, ...resources];
    },

    addResource(resource) {
      this.resources.push(resource);
    },

    moveDatesForward() {
      this.startDate = this.startDate.plus({ month: 1 }).startOf('month');
      this.endDate = this.endDate.plus({ month: 1 }).endOf('month');
    },

    moveDatesBack() {
      this.startDate = this.startDate.minus({ month: 1 }).startOf('month');
      this.endDate = this.endDate.minus({ month: 1 }).endOf('month');
    },

    resetDates() {
      this.startDate = startOfLastMonth;
      this.endDate = endOfNextMonth;
    },
  },
});
