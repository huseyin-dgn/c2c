import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const routes = [
  '/',
  '/cozumler',
  '/projeler',
  '/projeler/motionfighter',
  '/projeler/hyso',
  '/projeler/co2-emission',
  '/yaklasim',
  '/hakkimizda',
  '/iletisim',
  '/kvkk',
];
const documents = new Map();
for (const route of routes) {
  const response = await fetch(new URL(route, base));
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="tr"/, `${route}: language`);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${route}: one primary heading`);
  assert.ok(/<title>[^<]*C2C/.test(html), `${route}: title`);
  assert.match(html, /name="description"/, `${route}: description`);
  assert.match(html, /application\/ld\+json/, `${route}: structured data`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  documents.set(route, html);
}
const broken = [];
for (const [route, html] of documents) {
  for (const match of html.matchAll(/href="(\/[^"?#]*)(?:\?[^"#]*)?(#[^"]*)?"/g)) {
    const [path, fragment] = [match[1], match[2]?.slice(1)];
    if (path.startsWith('/_next/') || path === '/icon.svg') continue;
    if (!routes.includes(path)) broken.push(`${route} → ${path}`);
    if (fragment && !documents.get(path)?.includes(`id="${fragment}"`))
      broken.push(`${route} → ${path}#${fragment}`);
  }
}
assert.deepEqual(broken, [], 'internal links and fragment targets');
assert.match(documents.get('/'), /Karmaşık/);
assert.match(documents.get('/'), /core-fallback/);
assert.ok(
  /Gönderim henüz açık değil/.test(documents.get('/iletisim')),
  'contact status is server rendered',
);
assert.ok(/type="submit"[^>]*disabled/.test(documents.get('/iletisim')), 'submission is disabled');
const unavailable = await fetch(new URL('/api/contact', base), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}',
});
assert.equal(unavailable.status, 503);
assert.equal((await unavailable.json()).accepted, undefined);
assert.equal((await fetch(new URL('/api/contact', base))).status, 405);
assert.equal((await fetch(new URL('/projeler/bilinmeyen-proje', base))).status, 404);
for (const asset of ['/robots.txt', '/sitemap.xml', '/icon.svg', '/opengraph-image']) {
  const response = await fetch(new URL(asset, base));
  assert.equal(response.status, 200, asset);
  if (asset === '/opengraph-image')
    assert.match(response.headers.get('content-type'), /image\/png/);
}
const scripts = [...documents.get('/').matchAll(/<script[^>]+src="([^"]+)"/g)].map(
  (match) => match[1],
);
for (const path of scripts) assert.equal((await fetch(new URL(path, base))).status, 200, path);
console.log(
  `PASS: ${routes.length} pages, internal links/anchors, metadata, SSR fallback, disabled submission, API 503/405, project 404, 4 SEO assets, ${scripts.length} initial JS chunks.`,
);
