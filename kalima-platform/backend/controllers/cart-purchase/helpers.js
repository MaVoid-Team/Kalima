const { DateTime } = require("luxon");

const EGYPT_TIMEZONE = "Africa/Cairo";
const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 21;
const DEFAULT_STATS_START_DATE = new Date("2025-11-01");

const getCurrentEgyptTime = () => DateTime.now().setZone(EGYPT_TIMEZONE);

// Calculate minutes that fall within business hours between two dates
const calculateBusinessMinutes = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return 0;
  }

  const minutesBetween = (from, to) => (to.getTime() - from.getTime()) / 60000;
  let current = new Date(start);
  let total = 0;

  while (
    current.getFullYear() < end.getFullYear() ||
    current.getMonth() < end.getMonth() ||
    current.getDate() < end.getDate()
  ) {
    const businessStart = new Date(current);
    businessStart.setHours(BUSINESS_START_HOUR, 0, 0, 0);
    const businessEnd = new Date(current);
    businessEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

    const segmentStart = new Date(
      Math.max(current.getTime(), businessStart.getTime()),
    );
    const segmentEnd = new Date(
      Math.min(businessEnd.getTime(), new Date(current).setHours(23, 59, 59, 999)),
    );

    if (segmentEnd > segmentStart) {
      total += minutesBetween(segmentStart, segmentEnd);
    }

    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  const finalBusinessStart = new Date(end);
  finalBusinessStart.setHours(BUSINESS_START_HOUR, 0, 0, 0);
  const finalBusinessEnd = new Date(end);
  finalBusinessEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

  const finalStart = new Date(
    Math.max(current.getTime(), finalBusinessStart.getTime()),
  );
  const finalEnd = new Date(Math.min(end.getTime(), finalBusinessEnd.getTime()));

  if (finalEnd > finalStart) {
    total += minutesBetween(finalStart, finalEnd);
  }

  return Math.max(0, Math.round(total));
};

const formatMinutes = (minutes) => {
  if (minutes == null) return null;
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

module.exports = {
  BUSINESS_END_HOUR,
  BUSINESS_START_HOUR,
  DEFAULT_STATS_START_DATE,
  EGYPT_TIMEZONE,
  calculateBusinessMinutes,
  formatMinutes,
  getCurrentEgyptTime,
};
