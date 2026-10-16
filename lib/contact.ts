import { createHash } from 'node:crypto';
import { privacyNotice } from './privacy';
export function contactConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY &&
    process.env.CONTACT_TO &&
    process.env.CONTACT_FROM &&
    process.env.NEXT_PUBLIC_SITE_URL &&
    process.env.RATE_LIMIT_REST_URL &&
    process.env.RATE_LIMIT_REST_TOKEN &&
    process.env.CONTACT_IP_HEADER &&
    process.env.CONTACT_PRIVACY_APPROVED === 'true' &&
    privacyNotice &&
    process.env.CONTACT_PRIVACY_VERSION === privacyNotice.version,
  );
}
export async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `c2c:contact:${createHash('sha256').update(ip).digest('hex')}`;
  const script =
    "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],900) end; return n";
  const response = await fetch(process.env.RATE_LIMIT_REST_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RATE_LIMIT_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['EVAL', script, '1', key]),
    signal: AbortSignal.timeout(5000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Rate limit provider unavailable');
  const result = (await response.json()) as { result?: number; error?: string };
  if (typeof result.result !== 'number' || result.error)
    throw new Error('Invalid rate limit response');
  return result.result <= 5;
}
