/** Deterministic browser-only inspection model. Distances are illustrative station units. */
export const visionScenarios = [
  { id: 'scratch', name: 'Çizik / yüzey', title: 'Yüzey bütünlüğü', expected: 'Kontrol yüzeyinde kesintisiz işleme izi.', failure: 'Yüzey çizgisi kontrol alanını kesiyor.', observed: 'Sol üst yüzeyde kesintili çizik izi.' },
  { id: 'missing', name: 'Eksik delik', title: 'Özellik kontrolü', expected: 'Dört montaj deliği.', failure: 'Beklenen 4 deliğin 3 adedi mevcut.', observed: 'Sağ üst montaj deliği eksik.' },
  { id: 'alignment', name: 'Montaj / konum', title: 'Konum toleransı', expected: 'Merkez bileziği: X = 0 ± 1,0 mm.', failure: 'Bilezik +6,5 mm sapma ile tolerans dışında.', observed: 'Merkez bileziği sağa kaymış.' },
] as const;
export type VisionScenario = typeof visionScenarios[number]['id'];
export const station = { start: -4.35, camera: -1.45, reject: 2.35, exit: 5.1, speed: .9, spacingSeconds: 2.15, decisionDelay: .28, rejectDuration: .9 } as const;
export const productShape = { width: .82, depth: .6, holeX: .29, holeZ: .19, holeRadius: .046, bossRadius: .17, misalignment: .065 } as const;
export type Decision = 'pass' | 'reject';
export type Product = { id: string; serial: number; scenario: VisionScenario; defective: boolean; bornAt: number };
export type Inspection = { product: Product; capturedAt: number; decision: Decision | null; reason: string };
export type VisionEvent = { key: number; at: number; productId: string; kind: 'capture' | 'decision' | 'actuate' | 'pass' | 'reject'; message: string };
export type VisionState = {
  time: number; scenario: VisionScenario; nextSerial: number; nextSpawn: number; products: Product[];
  inspected: number; passed: number; rejected: number; inspection: Inspection | null; events: VisionEvent[]; eventSerial: number;
};
export function createVisionState(scenario: VisionScenario = 'scratch'): VisionState {
  return { time: 0, scenario, nextSerial: 1, nextSpawn: 0, products: [], inspected: 0, passed: 0, rejected: 0, inspection: null, events: [], eventSerial: 0 };
}
export function productTiming(product: Product) {
  const capture = product.bornAt + (station.camera - station.start) / station.speed;
  const eject = product.bornAt + (station.reject - station.start) / station.speed;
  return { capture, decision: capture + station.decisionDelay, eject, finish: product.defective ? eject + station.rejectDuration : product.bornAt + (station.exit - station.start) / station.speed };
}
export function decisionReason(product: Product) {
  const scenario = visionScenarios.find(s => s.id === product.scenario)!;
  return product.defective ? scenario.failure : product.scenario === 'scratch' ? 'Kontrol yüzeyinde çizik izi yok.' : product.scenario === 'missing' ? 'Dört montaj deliği mevcut.' : 'Merkez bileziği nominal konumda; tolerans içinde.';
}
/** Process threshold crossings in chronological order, even across a long frame. */
export function advanceVision(state: VisionState, seconds: number): VisionState {
  if (!Number.isFinite(seconds) || seconds <= 0) return state;
  const end = state.time + seconds;
  let { nextSerial, nextSpawn, inspected, passed, rejected, inspection, eventSerial } = state;
  const products = [...state.products], events = [...state.events];
  while (nextSpawn <= end) {
    products.push({ id: `P-${String(nextSerial).padStart(4, '0')}`, serial: nextSerial, scenario: state.scenario, defective: nextSerial % 3 === 2, bornAt: nextSpawn });
    nextSerial++; nextSpawn = (nextSerial - 1) * station.spacingSeconds;
  }
  type Action = { at: number; kind: VisionEvent['kind']; product: Product };
  const actions: Action[] = [];
  for (const product of products) {
    const timing = productTiming(product);
    const candidates: [number, VisionEvent['kind']][] = [[timing.capture, 'capture'], [timing.decision, 'decision'], [timing.finish, product.defective ? 'reject' : 'pass']];
    if (product.defective) candidates.push([timing.eject, 'actuate']);
    for (const [at, kind] of candidates) if (at > state.time && at <= end) actions.push({ at, kind, product });
  }
  actions.sort((a, b) => a.at - b.at || a.product.serial - b.product.serial);
  for (const { at, kind, product } of actions) {
    let message = '';
    if (kind === 'capture') {
      inspection = { product, capturedAt: at, decision: null, reason: 'Tetik alındı; tanımlı özellikler inceleniyor.' };
      message = 'CAM-01 · görüntü yakalandı';
    } else if (kind === 'decision') {
      inspected++; const decision = product.defective ? 'reject' : 'pass';
      if (inspection?.product.id === product.id) inspection = { ...inspection, decision, reason: decisionReason(product) };
      message = product.defective ? 'AYIR · karar ürün kimliğine bağlandı' : 'GEÇİR · kontrol uygun';
    } else if (kind === 'actuate') message = 'Ayırıcı tetiklendi · ürün istasyonda';
    else if (kind === 'pass') { passed++; message = 'Ana hat çıkışı · uygun ürün sayıldı'; }
    else { rejected++; message = 'Ayırma tamamlandı · hatalı ürün sayıldı'; }
    events.unshift({ key: ++eventSerial, at, productId: product.id, kind, message });
  }
  return { ...state, time: end, nextSerial, nextSpawn, inspected, passed, rejected, inspection, eventSerial, events: events.slice(0, 8), products: products.filter(p => end < productTiming(p).finish + (p.defective ? 1.1 : .05)) };
}
const smooth = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
export function productPose(product: Product, time: number) {
  const { eject, finish } = productTiming(product), age = time - eject;
  if (product.defective && age >= 0) {
    // Contact follows the pusher face; after the stroke the part coasts down the chute.
    const z = age <= .48 ? Math.max(0, 1.7 * smooth(age / .48) - .8) : .9 + 1.22 * smooth((age - .48) / .42);
    return { x: station.reject + .12 * z / 2.12, y: .694 - .42 * smooth((age - .5) / .4), z, stage: time >= finish ? 'rejected' : 'rejecting' };
  }
  return { x: station.start + (time - product.bornAt) * station.speed, y: .694, z: 0, stage: time >= finish ? 'passed' : time >= productTiming(product).decision ? 'decided' : 'approaching' };
}
export function actuatorPose(state: VisionState) {
  const product = state.products.find(p => p.defective && state.time >= productTiming(p).eject && state.time < productTiming(p).eject + 1.12);
  if (!product) return { stroke: 0, productId: null };
  const age = state.time - productTiming(product).eject;
  return { stroke: age < .48 ? smooth(age / .48) : 1 - smooth((age - .55) / .57), productId: product.id };
}
export function nextVisionEvent(state: VisionState) {
  if (state.nextSpawn <= state.time + 1e-6) return advanceVision(state, .001);
  const candidates = [state.nextSpawn];
  for (const p of state.products) { const t = productTiming(p); candidates.push(t.capture, t.decision, t.finish); if (p.defective) candidates.push(t.eject); }
  const next = Math.min(...candidates.filter(time => time > state.time + 1e-6));
  return advanceVision(state, Math.max(.001, next - state.time + 1e-5));
}
export const formatVisionTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}.${Math.floor(seconds % 1 * 10)}`;
