# Industrial vision experience

Recovered as `components/IndustrialVisionDemo.tsx`, independently of the deleted legacy four-scenario `CameraDemo`. The home page renders it before the existing `ProblemStory`, which is preserved byte-for-byte along with Hero, Hardware Experience and shared styles.

## Recovery provenance

Source: local Codex session `C:/Users/hdgn5/.codex/sessions/2026/10/16/rollout-2026-10-16T18-44-39-01a14563-0598-7af1-9db1-b91dba96968e.jsonl`.

Original writes and subsequent fixes were replayed in a temporary directory from lines 468, 477, 482, 491, 498, 508, 513, 525, 534 and 560. The last line's unrelated edit to `scripts/interactive-qa.mjs` was excluded. Only the recovered component export was renamed from `CameraDemo` to `IndustrialVisionDemo`; the simulation implementation and styles were restored from the session. The original recovered section anchor `kamera-deneyimi` remains for its browser checks.

Git branches, history, reflogs and unreachable objects were inspected. They contain the older four-scenario demo and a backup of the current worktree, rather than this manufacturing implementation. No branch, index, stash or pre-existing uncommitted file was restored or deleted.

## Model and assumptions

The deterministic simulation uses simulation time and analytic threshold crossings, not frame counts or independent timers. Every part receives an immutable ID, defect assignment and scenario at birth. Captures, delayed decisions, reject commands and terminal pass/reject events are processed chronologically. A decision increments the inspected count. Only a completed main-line exit or reject motion increments an outcome count. In-flight work can therefore explain the difference between inspected and completed totals.

The pneumatic stroke and lateral part motion use the same clock and product ID. The part follows the face during contact and then coasts down a lowered chute. These are illustrative kinematics, not a physics or PLC safety model. Product spacing exceeds the stroke/return interval. The three fixed defect templates are a scratch, a missing mounting hole and a shifted center boss (+6.5 mm against an illustrative ±1.0 mm limit). No inference model or camera stream is used; there are no confidence or production-performance claims.

Visibility and document-hidden state suspend the simulation clock. Resume starts with a fresh wall-clock timestamp, without fast-forward. Pausing freezes parts, belt, actuator, counters and annotation windows. Reset and scenario changes clear the full session and return to a paused state. Reduced-motion uses a manual next-event control and demand-rendered static poses.

## Visual assets and ownership

All station, camera, flange, lens, roller, extrusion and reject geometry is authored procedurally for this repository. Metal microfinish, belt texture and labels are generated locally in memory; no downloaded asset, camera permission, external image, model or runtime network dependency is introduced. The existing Three.js `RoomEnvironment`/PMREM utilities provide a local studio reflection map (Three.js MIT license). No change to shared Hero or Hardware materials, geometry or environment resources is needed. The camera analysis panel is an original SVG macro illustration using the same dimensions and defect locations as the 3D product.

The model is an engineering communication illustration, not verified machine CAD. Real systems need validated imaging, exposure/lighting, conveyor/encoder calibration, deterministic PLC/I/O timing, reject verification and machine safety design.

## Technical references

- Basler, Triggered Image Acquisition: https://docs.baslerweb.com/triggered-image-acquisition — sensor-triggered image capture.
- Basler, Frame Grabber Trigger Boards: https://www.baslerweb.com/en-us/acquisition-cards/trigger-boards/ — synchronization of acquisition, light barriers, lighting and shaft encoders.
- Cognex, Presence/Absence Tools – Contrast: https://docs.cognex.com/is_631/web/EN/ezb/Content/EasyBuilder/Inspect_PA_Contrast.htm — illustrative presence/absence inspection context.

These references inform the station concept. They are not assets, integrations, vendor endorsements or evidence of a deployed customer project.

## Verification

`node --import tsx --test tests/vision-simulation.test.ts` checks refresh-rate independence, chronological ID/decision matching, single counting, bounded product history, physical counter stages, pusher contact, all scenarios, reset and manual stepping. Browser evidence is captured separately for desktop, 393 px, 320 px, keyboard, visibility, pause/resume and reduced motion.

## Recovery validation

- `npm run typecheck`: passed.
- `npm run lint`: passed across the repository with zero warnings.
- `node --import tsx --test tests/vision-simulation.test.ts`: 6/6 passed.
- `node scripts/vision-qa.mjs`: passed desktop, 393 px and 320 px controls, all three scenarios, pause/resume, reset, product/actuator matching, counters, hidden/offscreen suspension, keyboard and reduced-motion stepping; no browser runtime or WebGL errors.
- Browser report and screenshots: `C:/Users/hdgn5/AppData/Local/Temp/c2c-industrial-vision/`.
- SHA-256 comparison against the pre-recovery worktree confirmed all pre-existing source files stayed unchanged except the intended import/render addition in `app/page.tsx`. TypeScript also refreshed the ignored `tsconfig.tsbuildinfo` cache.
