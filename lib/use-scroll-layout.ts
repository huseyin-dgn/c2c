'use client';
import { useEffect, type RefObject } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
let refreshFrame:number|null=null;
export function requestScrollRefresh() {
  if(refreshFrame!==null)return;
  refreshFrame=requestAnimationFrame(()=>{refreshFrame=null;if(ScrollTrigger.getAll().length)ScrollTrigger.refresh();});
}

/** Interactive copy can change the height of content above a pinned scene. */
export function useScrollLayout(ref:RefObject<HTMLElement|null>) {
  useEffect(()=>{
    let disposed=false;
    const refresh=()=>{if(!disposed)requestScrollRefresh();};
    const observer=new ResizeObserver(refresh);
    if(ref.current)observer.observe(ref.current);
    void document.fonts.ready.then(refresh);
    return()=>{disposed=true;observer.disconnect();};
  },[ref]);
}
