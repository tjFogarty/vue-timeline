import { DateTime } from 'luxon';

export const today = DateTime.now();
export const startOfLastMonth = today.minus({ month: 2 }).startOf('month');
export const endOfNextMonth = today.plus({ month: 2 }).endOf('month');
