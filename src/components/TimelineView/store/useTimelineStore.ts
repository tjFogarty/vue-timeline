import { defineStore } from 'pinia';
import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';

interface EventItem {
  id: number;
  name: string;
  projectId: number;
  startDate: DateTime;
  endDate: DateTime;
}

interface ResourceItem {
  id: number;
  name: string;
  colour: string;
}

interface RootState {
  events: EventItem[];
  resources: ResourceItem[];
  columnWidth: number;
  resourceWidth: number;
  rowHeight: number;
  headerHeight: number;
  startDate: DateTime;
  endDate: DateTime;
  textDir: 'ltr' | 'rtl' | 'auto';
}

const today = new Date();
const startOfLastMonth = new DateTime(today)
  .minus({ month: 2 })
  .startOf('month');
const endOfNextMonth = new DateTime(today).plus({ month: 2 }).endOf('month');

export const useTimelineStore = defineStore('timeline', {
  state: () =>
    ({
      events: [],
      resources: [],
      columnWidth: 120,
      resourceWidth: 200,
      rowHeight: 50,
      headerHeight: 80,
      startDate: startOfLastMonth,
      endDate: endOfNextMonth,
      textDir: 'ltr',
    } as RootState),

  getters: {
    isRTL(): boolean {
      return this.textDir === 'rtl';
    },

    dates(): DateTime[] {
      let start = new DateTime(this.startDate);
      const dates: DateTime[] = [];

      while (start <= this.endDate) {
        dates.push(start);
        start = start.plus({ day: 1 });
      }

      return dates;
    },

    groupedDatesByMonth(): Record<string, DateTime[]> {
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

    groupedMonthsByYear(): Record<string, Record<string, DateTime[]>> {
      const groupedMonths = {};
      this.dates.forEach((date) => {
        const year = date.toFormat('y');
        const month = date.toFormat('MMMM');

        if (!groupedMonths[year]) {
          groupedMonths[year] = {};
        }

        if (!groupedMonths[year][month]) {
          groupedMonths[year][month] = [];
        }

        groupedMonths[year][month].push(date);
      });
      return groupedMonths;
    },

    datePositions(): Record<string, number> {
      const positions = {};

      this.dates.forEach((date, index) => {
        positions[date.toFormat(DATE_FORMAT)] =
          index * this.columnWidth + this.resourceWidth;
      });

      return positions;
    },

    timelineWidth(): number {
      return this.dates.length * this.columnWidth + this.resourceWidth;
    },

    weekendOccurences(): Record<string, number> {
      let leftPos = this.resourceWidth;

      const weekends = this.dates
        .map((d) => {
          leftPos = leftPos + this.columnWidth;

          if (parseInt(d.toFormat('c'), 10) === 6) {
            const position = leftPos - this.columnWidth;

            return {
              date: d,
              leftPos: this.isRTL ? -position : position,
            };
          }

          return null;
        })
        .filter((d) => d !== null);

      return weekends;
    },

    eventsGroupedByResource(): Record<string, EventItem[]> {
      const grouped = {};

      this.resources.forEach((p) => {
        const resourceEvents = this.events
          .filter((t) => t.resourceId === p.id)
          .sort((a, b) => {
            return a.startDate - b.startDate;
          });

        if (resourceEvents.length) {
          grouped[p.id] = resourceEvents;
        }
      });

      return grouped;
    },

    height(): number {
      let totalHeight = 0;

      this.resources.forEach(() => {
        totalHeight += this.rowHeight;
      });

      return totalHeight;
    },

    resPos(): Record<string, { top: number; height: number }> {
      const heightPosMap = {};
      let totalHeight = this.headerHeight;
      this.resources.forEach((r) => {
        const height = this.rowHeight;

        totalHeight += height;

        heightPosMap[r.id] = {
          top: totalHeight - this.rowHeight,
          height,
        };
      });

      return heightPosMap;
    },

    eventPositions(): Record<
      string,
      { left: number; top: number; width: number }
    > {
      const positions = {};
      this.events.forEach((event) => {
        const start = DateTime.fromFormat(event.startDate, DATE_FORMAT);
        const end = DateTime.fromFormat(event.endDate, DATE_FORMAT);

        if (start < this.startDate || end > this.endDate) {
          return;
        }

        const dateIndex = this.dates.findIndex((d) => d.hasSame(start, 'day'));

        if (dateIndex !== -1) {
          const leftPos = this.datePositions[event.startDate];
          const { days } = end.diff(start, 'days').toObject();
          const topPos = this.resPos[event.resourceId].top;

          positions[event.id] = {
            left: leftPos,
            top: topPos,
            width: (days + 1) * this.columnWidth,
          };
        }
      });

      return positions;
    },

    todayPosition(): number {
      const now = new DateTime(today);

      return this.dates.findIndex((d) => {
        return d.hasSame(now, 'day');
      });
    },

    resourceTimelines() {
      const resourceTimelines = {};

      this.resources.forEach((resource) => {
        const resourceEvents = this.events.filter(
          (event) => event.resourceId === resource.id
        );

        if (resourceEvents.length) {
          const startDates = resourceEvents.map((event) => DateTime.fromFormat(event.startDate, DATE_FORMAT));
          const endDates = resourceEvents.map((event) => DateTime.fromFormat(event.endDate, DATE_FORMAT));

          const minStartDate = DateTime.min(...startDates);
          const maxEndDate = DateTime.max(...endDates);
          const { days } = maxEndDate.diff(minStartDate, 'days').toObject();
          const topPos = this.resPos[resource.id].top;
          const leftPos = this.datePositions[minStartDate.toFormat(DATE_FORMAT)];

          resourceTimelines[resource.id] = {
            startDate: minStartDate.toFormat(DATE_FORMAT),
            endDate: maxEndDate.toFormat(DATE_FORMAT),
            left: this.isRTL ? -leftPos : leftPos,
            top: topPos,
            width: (days + 1) * this.columnWidth,
          };
        }
      });

      return resourceTimelines;
    }
  },
  actions: {
    setConfig(config) {
      Object.keys(config).forEach((prop) => {
        this[prop] = config[prop];
      });
    },

    addEvents(events: EventItem[]) {
      this.events = [...this.events, ...events];
    },

    addEvent(event: EventItem) {
      this.events.push(event);
    },

    addResources(resources: ResourceItem[]) {
      this.resources = [...this.resources, ...resources];
    },

    addResource(resource: ResourceItem) {
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
