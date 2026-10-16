import { NextResponse } from 'next/server';
import { checkRateLimit, contactConfigured } from '@/lib/contact';
import { validateContact } from '@/lib/contact-validation';
import { privacyNotice } from '@/lib/privacy';
export const runtime = 'nodejs';
const reply = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
  if (!contactConfigured())
    return reply('Proje talebi gönderimi henüz etkin değil. Bu formdan veri gönderilmedi.', 503);
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin)
    return reply('Geçersiz istek kaynağı.', 403);
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return reply('JSON içerik bekleniyor.', 415);
  const ip = request.headers.get(process.env.CONTACT_IP_HEADER!)?.split(',')[0]?.trim();
  if (!ip) return reply('İstek doğrulanamadı.', 503);
  try {
    if (!(await checkRateLimit(ip)))
      return NextResponse.json(
        { error: 'Çok fazla deneme yapıldı. 15 dakika sonra yeniden deneyin.' },
        {
          status: 429,
          headers: { 'Retry-After': '900', 'Cache-Control': 'no-store' },
        },
      );
  } catch {
    return reply('Gönderim şu anda kullanılamıyor. Lütfen daha sonra deneyin.', 503);
  }
  // Bound the actual stream, including requests without a Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) return reply('Form verisi bulunamadı.', 400);
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 24000) {
        await reader.cancel();
        return reply('İstek çok büyük.', 413);
      }
      chunks.push(value);
    }
  } catch {
    return reply('İstek okunamadı.', 400);
  }
  let input: unknown;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return reply('Geçersiz form verisi.', 400);
  }
  const result = validateContact(input);
  if (!result.ok) return reply(result.error, 400);
  const data = result.data;
  const text = [
    `Ad Soyad: ${data.name}`,
    `Şirket / Kurum: ${data.company}`,
    `E-posta: ${data.email}`,
    `Telefon: ${data.phone || 'Belirtilmedi'}`,
    `Çözüm alanı: ${data.area || 'Belirtilmedi'}`,
    '',
    data.message,
    '',
    `Aydınlatma sürümü: ${privacyNotice?.version}`,
  ].join('\n');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM,
        to: [process.env.CONTACT_TO],
        reply_to: data.email,
        subject: 'C2C Mühendislik — Yeni proje talebi',
        text,
      }),
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });
    if (!response.ok)
      return reply(
        'Gönderim sağlayıcısı talebi kabul etmedi. Lütfen daha sonra yeniden deneyin.',
        502,
      );
    const receipt = (await response.json()) as { id?: string };
    if (!receipt.id) return reply('Gönderim onayı alınamadı.', 502);
    return NextResponse.json({ accepted: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return reply('Gönderim onayı alınamadı. Lütfen daha sonra yeniden deneyin.', 502);
  }
}
