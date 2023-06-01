import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';

export default {
  isRTL() {
    return this.textDir === 'rtl';
  },

  dates() {
    const dates = [];
    let currentDate = this.startDate;
    while (currentDate <= this.endDate) {
      dates.push(currentDate);
      currentDate = currentDate.plus({ day: 1 });
    }
    return dates;
  },

  groupedDatesByMonth() {
    const groupedDates = new Map();
    this.dates.forEach((date) => {
      const month = date.toFormat('MMMM y');
      if (!groupedDates.has(month)) {
        groupedDates.set(month, []);
      }
      groupedDates.get(month).push(date);
    });
    return Object.fromEntries(groupedDates);
  },

  groupedMonthsByYear() {
    const groupedMonths = new Map();
    this.dates.forEach((date) => {
      const year = date.toFormat('y');
      const month = date.toFormat('MMMM');
      if (!groupedMonths.has(year)) {
        groupedMonths.set(year, new Map());
      }
      if (!groupedMonths.get(year).has(month)) {
        groupedMonths.get(year).set(month, []);
      }
      groupedMonths.get(year).get(month).push(date);
    });
    return Object.fromEntries(
      [...groupedMonths].map(([year, months]) => [
        year,
        Object.fromEntries(months),
      ]),
    );
  },

  datePositions() {
    const positions = {};

    this.dates.forEach((date, index) => {
      positions[date.toFormat(DATE_FORMAT)] =
        index * this.columnWidth + this.resourceWidth;
    });

    return positions;
  },

  timelineWidth() {
    return this.dates.length * this.columnWidth + this.resourceWidth;
  },

  weekendOccurences() {
    let leftPos = this.resourceWidth;
    const weekends = [];

    this.dates.forEach((d) => {
      if (parseInt(d.toFormat('c'), 10) === 6) {
        const position = leftPos;
        weekends.push({
          date: d,
          leftPos: this.isRTL ? -position : position,
        });
      }
      leftPos = leftPos + this.columnWidth;
    });

    return weekends;
  },

  rowHeights() {
    const heights = {};

    this.resources.forEach((r) => {
      if (this.openResources.includes(r.id)) {
        const events = this.eventsGroupedByResource[r.id];
        heights[r.id] = (events.length + 1) * this.rowHeight;
      } else {
        heights[r.id] = this.rowHeight;
      }
    });

    return heights;
  },

  height() {
    let totalHeight = 0;

    Object.values(this.rowHeights).forEach((h) => {
      totalHeight += h;
    });

    return totalHeight + this.headerHeight;
  },

  resourcePositions() {
    const positions = new Map();

    this.resources.forEach((r, index) => {
      const previousHeights = this.resources
        .slice(0, index)
        .map((r) => this.rowHeights[r.id])
        .reduce((a, b) => a + b, 0);

      positions.set(r.id, {
        top: previousHeights + this.headerHeight,
      });
    });

    return Object.fromEntries(positions);
  },

  eventPositions() {
    const positions = {};
    this.events.forEach((event) => {
      if (event.startDate < this.startDate || event.endDate > this.endDate) {
        return;
      }

      const dateIndex = this.dates.findIndex((d) =>
        d.hasSame(event.startDate, 'day'),
      );

      if (dateIndex !== -1) {
        const leftPos =
          this.datePositions[event.startDate.toFormat(DATE_FORMAT)];
        const { days = 1 } = event.endDate
          .diff(event.startDate, 'days')
          .toObject();
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

  todayPosition() {
    const now = DateTime.now();

    return this.dates.findIndex((d) => {
      return d.hasSame(now, 'day');
    });
  },

  resourceTimelines() {
    const resourceTimelines = {};

    this.resources.forEach((resource) => {
      const resourceEvents = this.events.filter(
        (event) => event.resourceId === resource.id,
      );
      const hasDates = resource.startDate && resource.dueDate;

      if (resourceEvents.length) {
        const startDates = resourceEvents.map((event) =>
          DateTime.fromFormat(event.startDate, DATE_FORMAT),
        );
        const endDates = resourceEvents.map((event) =>
          DateTime.fromFormat(event.endDate, DATE_FORMAT),
        );

        const minStartDate = hasDates
          ? DateTime(resource.startDate)
          : DateTime.min(...startDates);
        const maxEndDate = hasDates
          ? DateTime(resource.dueDate)
          : DateTime.max(...endDates);
        const { days = 1 } = maxEndDate.diff(minStartDate, 'days').toObject();
        const topPos = this.resourcePositions[resource.id].top;
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
  },

  eventsGroupedByResource() {
    const eventsGroupedByResource = {};

    this.resources.forEach((resource) => {
      eventsGroupedByResource[resource.id] = this.events.filter(
        (event) => event.resourceId === resource.id,
      );
    });

    return eventsGroupedByResource;
  },

  cssVars() {
    return {
      '--column-width': `${this.columnWidth}px`,
      '--resource-width': `${this.resourceWidth}px`,
      '--row-height': `${this.rowHeight}px`,
      '--header-height': `${this.headerHeight}px`,
      '--timeline-width': `${this.timelineWidth}px`,
      '--timeline-height': `${this.height}px`,
    };
  },
};
