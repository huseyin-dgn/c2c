import { ImageResponse } from 'next/og';
export const alt = 'C2C Mühendislik — Problemden çalışan sisteme';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        background: '#061f19',
        color: '#f6f3e9',
        padding: 70,
        fontFamily: 'sans-serif',
        borderBottom: '2px solid #c8a968',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 60, fontWeight: 800 }}>c2c.</span>
        <span style={{ fontSize: 18, color: '#d7d6c9', letterSpacing: 4 }}>MÜHENDİSLİK</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 66,
          fontWeight: 700,
          letterSpacing: -3,
          lineHeight: 1.15,
        }}
      >
        <span>Karmaşık Problemler.</span>
        <span style={{ color: '#d7d6c9', fontFamily: 'serif', fontStyle: 'italic' }}>
          Akıllı Çözümler.
        </span>
      </div>
      <span style={{ fontSize: 20, color: '#c8a968' }}>
        YAPAY ZEKÂ / BİLGİSAYARLI GÖRÜ / OTOMASYON / ÖZEL YAZILIM
      </span>
    </div>,
    size,
  );
}
