'use client';
import {useEffect,useState,type RefObject} from 'react';

/** One-way preparation threshold; leaving the viewport does not restart a load. */
export function useNearViewport(ref:RefObject<Element|null>,rootMargin='400px 0px',enabled=true){
  const [requested,setRequested]=useState(false);
  useEffect(()=>{
    if(!enabled||requested)return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){setRequested(true);observer.disconnect();}
    },{rootMargin});
    if(ref.current)observer.observe(ref.current);
    return()=>observer.disconnect();
  },[ref,rootMargin,enabled,requested]);
  return requested;
}
