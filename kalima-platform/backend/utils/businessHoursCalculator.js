const BUSINESS_START_HOUR = 9; // 9 AM
const BUSINESS_END_HOUR = 21;   // 9 PM

const isWithinBusinessHours = (date) => {
    const hour = date.getHours();
    return hour >= BUSINESS_START_HOUR && hour < BUSINESS_END_HOUR;
};

const getNextBusinessHourStart = (date) => {
    const result = new Date(date);
    const hour = date.getHours();

    if (hour < BUSINESS_START_HOUR) {
        // Set to today's business start
        result.setHours(BUSINESS_START_HOUR, 0, 0, 0);
    } else if (hour >= BUSINESS_END_HOUR) {
        // Set to next day's business start
        result.setDate(result.getDate() + 1);
        result.setHours(BUSINESS_START_HOUR, 0, 0, 0);
    }

    return result;
};

const calculateBusinessHoursDiff = (startDate, endDate) => {
    let start = new Date(startDate);
    const end = new Date(endDate);
    let totalMinutes = 0;

    // If start is outside business hours, move to next business hour start
    if (!isWithinBusinessHours(start)) {
        start = getNextBusinessHourStart(start);
    }

    while (start < end) {
        // If we're in business hours, count the time
        if (isWithinBusinessHours(start)) {
            const nextHour = new Date(start);
            nextHour.setHours(start.getHours() + 1);

            // If next hour is beyond end time, only count until end time
            if (nextHour > end) {
                totalMinutes += (end - start) / (1000 * 60);
            } else {
                totalMinutes += 60;
            }
        }

        // Move to next hour
        start.setHours(start.getHours() + 1);

        // If we've reached end of business day, move to start of next business day
        if (start.getHours() === BUSINESS_END_HOUR) {
            start.setDate(start.getDate() + 1);
            start.setHours(BUSINESS_START_HOUR, 0, 0, 0);
        }
    }

    return totalMinutes;
};

module.exports = {
    calculateBusinessHoursDiff,
    BUSINESS_START_HOUR,
    BUSINESS_END_HOUR
};