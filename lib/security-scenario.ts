/** Illustrative image-plane coordinates; no camera stream or model inference. */
export const safetyZone = [[575, 410], [805, 375], [930, 590], [610, 620]] as const;
export function pointInSafetyZone(x: number, y: number) {
  let inside = false;
  for (let i = 0, j = safetyZone.length - 1; i < safetyZone.length; j = i++) {
    const [xi, yi] = safetyZone[i], [xj, yj] = safetyZone[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function securityFrame(progress: number) {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const phase = Math.min(4, Math.floor(p * 5 + .001));
  // The person is first detected outside the zone; only the third chapter crosses its boundary.
  const x = p < .4 ? 430 + 140 * p / .4 : 570 + 85 * Math.min(1, (p - .4) / .18);
  const y = 558 - (x - 430) * .095;
  const inside = pointInSafetyZone(x, y);
  const detected = phase >= 1;
  const condition = detected && inside;
  const alert = condition && phase >= 3;
  return { progress: p, phase, x, y, inside, detected, condition, alert, recorded: alert && phase === 4 };
}
