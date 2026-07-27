import assert from 'node:assert/strict';
import test from 'node:test';

import { openWhatsAppDraft } from './whatsappDraft.js';

test('opens an encoded WhatsApp draft in a new window without sending it', () => {
  const openedWindows = [];

  openWhatsAppDraft({
    phone: '01023044000',
    message: 'Please confirm this order.',
    openWindow: (...args) => openedWindows.push(args),
  });

  assert.deepEqual(openedWindows, [[
    'https://wa.me/201023044000?text=Please%20confirm%20this%20order.',
    '_blank',
    'noopener,noreferrer',
  ]]);
});

test('does not open WhatsApp for an invalid customer phone number', () => {
  const openedWindows = [];

  const opened = openWhatsAppDraft({
    phone: '123',
    message: 'Please confirm this order.',
    openWindow: (...args) => openedWindows.push(args),
  });

  assert.equal(opened, false);
  assert.deepEqual(openedWindows, []);
});
