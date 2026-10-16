export type CoreKeyframe = {
  separation: number;
  processing: number;
  integration: number;
  rotation: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
};
export const coreKeyframes: readonly CoreKeyframe[] = [
  {
    separation: 0,
    processing: 0,
    integration: 0,
    rotation: -0.35,
    cameraX: 5.8,
    cameraY: 3.8,
    cameraZ: 7.5,
  },
  {
    separation: 0.55,
    processing: 0.15,
    integration: 0,
    rotation: 0,
    cameraX: 4.7,
    cameraY: 2.6,
    cameraZ: 6.6,
  },
  {
    separation: 1,
    processing: 1,
    integration: 0,
    rotation: 0.35,
    cameraX: 5.3,
    cameraY: 2.3,
    cameraZ: 9.6,
  },
  {
    separation: 0.62,
    processing: 0.75,
    integration: 0.25,
    rotation: 1.1,
    cameraX: 4.8,
    cameraY: 1.45,
    cameraZ: 8.3,
  },
  {
    separation: 0,
    processing: 0,
    integration: 1,
    rotation: 1.57,
    cameraX: 5.6,
    cameraY: 3.2,
    cameraZ: 8.1,
  },
];
export function coreMotion(progress: number): CoreKeyframe {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const section = Math.min(3, Math.floor(p * 4));
  const local = p * 4 - section;
  const t = local * local * (3 - 2 * local);
  const a = coreKeyframes[section],
    b = coreKeyframes[section + 1];
  return Object.fromEntries(
    Object.keys(a).map((key) => {
      const k = key as keyof CoreKeyframe;
      // Camera and rotation keep continuous velocity across chapter boundaries.
      // Mechanical assembly remains eased and bounded at the authored poses.
      if (k.startsWith('camera') || k === 'rotation') {
        const previous = coreKeyframes[Math.max(0, section - 1)];
        const following = coreKeyframes[Math.min(4, section + 2)];
        const tangentA = section === 0 ? 0 : (b[k] - previous[k]) / 2;
        const tangentB = section === 3 ? 0 : (following[k] - a[k]) / 2;
        const u = local, u2 = u * u, u3 = u2 * u;
        return [k, (2*u3 - 3*u2 + 1)*a[k] + (u3 - 2*u2 + u)*tangentA + (-2*u3 + 3*u2)*b[k] + (u3 - u2)*tangentB];
      }
      return [k, a[k] + (b[k] - a[k]) * t];
    }),
  ) as CoreKeyframe;
}
