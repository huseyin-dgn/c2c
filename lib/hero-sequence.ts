import {coreMotion,coreKeyframes} from './core-motion';

// One original-length assembly sequence, a brief seated hold, then the dolly.
// Story extends its pin by the same factor: no existing mechanical beat speeds up.
export const heroTiming={assembly:1,closedHold:.02,pullback:.13,total:1.15} as const;
export const heroClosureProgress=heroTiming.assembly/heroTiming.total;
export const heroPullbackProgress=(heroTiming.assembly+heroTiming.closedHold)/heroTiming.total;
export function heroAssemblyProgress(progress:number){
  return Math.min(1,Math.max(0,Number.isFinite(progress)?progress:0)*heroTiming.total);
}
export function heroMotion(progress:number){
  const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
  const assemblyProgress=heroAssemblyProgress(p),pose=coreMotion(assemblyProgress);
  const t=Math.max(0,Math.min(1,(p-heroPullbackProgress)/(1-heroPullbackProgress)));
  const pullback=t*t*(3-2*t),opening=coreKeyframes[0];
  for(const key of ['cameraX','cameraY','cameraZ'] as const)pose[key]+=(opening[key]-pose[key])*pullback;
  return {assemblyProgress,pullback,pose};
}
