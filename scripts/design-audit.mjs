import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const hashes = JSON.parse(
  (await fs.readFile('artifacts/backend-before.json', 'utf8')).replace(/^\uFEFF/, ''),
);
for (const item of hashes) {
  const data = await fs.readFile(item.Path);
  assert.equal(
    createHash('sha256').update(data).digest('hex').toUpperCase(),
    item.Hash,
    `backend unchanged: ${item.Path}`,
  );
}
async function files(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await files(file)));
    else if (/\.(css|tsx|svg)$/.test(file)) out.push(file);
  }
  return out;
}
const violations = [];
const colors = new Set();
for (const file of [...(await files('app')), ...(await files('components'))]) {
  const source = await fs.readFile(file, 'utf8');
  assert.ok(!/--(?:blue|cyan)\b/i.test(source), `removed legacy tokens: ${file}`);
  for (const match of source.matchAll(/#([a-f\d]{6})(?:[a-f\d]{2})?\b/gi)) {
    const hex = match[1];
    colors.add(hex);
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255),
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min;
    if (d < 0.08) continue;
    let hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hue = (hue * 60 + 360) % 360;
    if (hue > 185 && hue < 280) violations.push({ file, color: '#' + hex, hue });
  }
}
assert.deepEqual(violations, [], 'no electric blue, cyan or navy in UI, SVG, OG or 3D materials');
console.log(
  `PASS: ${hashes.length} backend/security files unchanged; ${colors.size} palette values audited, no legacy blue/cyan/navy.`,
);
