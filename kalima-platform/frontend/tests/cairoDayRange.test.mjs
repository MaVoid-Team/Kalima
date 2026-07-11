import assert from 'node:assert/strict';
import test from 'node:test';

import { getCairoDayRange } from '../src/lib/cairoDayRange.js';

test('uses Cairo midnight during daylight-saving time', () => {
    const range = getCairoDayRange(new Date('2026-07-11T12:00:00Z'));

    assert.deepEqual(range, {
        startDate: '2026-07-10T21:00:00.000Z',
        endDate: '2026-07-11T20:59:59.999Z'
    });
});

test('uses Cairo midnight during standard time', () => {
    const range = getCairoDayRange(new Date('2026-01-11T12:00:00Z'));

    assert.deepEqual(range, {
        startDate: '2026-01-10T22:00:00.000Z',
        endDate: '2026-01-11T21:59:59.999Z'
    });
});
