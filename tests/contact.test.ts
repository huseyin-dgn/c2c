import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact } from '../lib/contact-validation';
import { contactConfigured } from '../lib/contact';
import { POST } from '../app/api/contact/route';
const now = 1800000000000;
const valid = {
  name: 'Test Kullanıcı',
  company: 'Test Kurumu',
  email: 'test@example.com',
  phone: '',
  area: '',
  message: 'Üretim hattında kalite kontrol için bir çözüm arıyoruz.',
  website: '',
  startedAt: now - 10000,
  acknowledged: true,
};
test('accepts a valid request with optional fields empty', () =>
  assert.equal(validateContact(valid, now).ok, true));
test('rejects malformed input, oversized fields and invalid addresses', () => {
  for (const input of [
    null,
    [],
    { ...valid, name: 'A' },
    { ...valid, message: 'x'.repeat(5001) },
    { ...valid, email: 'test@example.com\r\nBcc:bad@example.com' },
    { ...valid, email: 'invalid' },
  ])
    assert.equal(validateContact(input, now).ok, false);
});
test('rejects honeypot, missing acknowledgement and bot timing', () => {
  for (const input of [
    { ...valid, website: 'spam' },
    { ...valid, acknowledged: false },
    { ...valid, startedAt: now },
    { ...valid, startedAt: now - 86400001 },
    { ...valid, startedAt: NaN },
  ])
    assert.equal(validateContact(input, now).ok, false);
});
test('delivery stays disabled without an approved real privacy notice', () =>
  assert.equal(contactConfigured(), false));
test('unconfigured endpoint returns 503 without reporting success', async () => {
  const response = await POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify(valid),
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.ok(body.error);
  assert.equal(body.accepted, undefined);
});
