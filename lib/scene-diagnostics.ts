// Bounded, in-memory diagnostics. Nothing is sent to a server.
export const sceneErrors: string[] = [];

export function recordSceneError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (sceneErrors.at(-1) !== message) sceneErrors.push(message);
  if (sceneErrors.length > 20) sceneErrors.shift();
}
