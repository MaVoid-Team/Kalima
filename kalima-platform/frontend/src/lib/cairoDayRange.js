const CAIRO_TIME_ZONE = 'Africa/Cairo';

const cairoDateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAIRO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

const cairoDateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAIRO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
});

const partsToObject = (parts) => Object.fromEntries(
    parts.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)])
);

const getCairoOffset = (instant) => {
    const parts = partsToObject(cairoDateTimeFormatter.formatToParts(instant));
    const displayedAsUtc = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
    );

    return displayedAsUtc - Math.floor(instant.getTime() / 1000) * 1000;
};

const cairoMidnightToUtc = ({ year, month, day }) => {
    const targetAsUtc = Date.UTC(year, month - 1, day);
    let instant = new Date(targetAsUtc);

    for (let attempt = 0; attempt < 3; attempt += 1) {
        instant = new Date(targetAsUtc - getCairoOffset(instant));
    }

    return instant;
};

const addCalendarDay = ({ year, month, day }) => {
    const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

    return {
        year: nextDay.getUTCFullYear(),
        month: nextDay.getUTCMonth() + 1,
        day: nextDay.getUTCDate()
    };
};

export const getCairoDayRange = (now = new Date()) => {
    const cairoDate = partsToObject(cairoDateFormatter.formatToParts(now));
    const start = cairoMidnightToUtc(cairoDate);
    const nextStart = cairoMidnightToUtc(addCalendarDay(cairoDate));

    return {
        startDate: start.toISOString(),
        endDate: new Date(nextStart.getTime() - 1).toISOString()
    };
};
