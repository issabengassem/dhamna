'use client';

import Image from 'next/image';
import {useEffect,useRef,useState,type CSSProperties} from 'react';

export const photographs = [
  {image:'/images/bedroom.png',title:'The quiet room',detail:'Soft linen. Deep rest.',alt:'Warm stone bedroom with soft linen and amber lamps at dusk'},
  {image:'/images/pavilion.png',title:'An open invitation',detail:'Morning light. Nothing planned.',alt:'Open coastal pavilion with soft seating overlooking the Mediterranean sea'},
  {image:'/images/cove.png',title:'A world of your own',detail:'Salt water. A little solitude.',alt:'Quiet limestone cove with soft silvery water along a Mediterranean coastline'},
  {image:'/images/ritual.png',title:'The smallest luxuries',detail:'Warm coffee. Time to linger.',alt:'Off-white linen chair and ceramic coffee cup by a sunlit window overlooking the sea'},
  {image:'/images/hero.png',title:'Where the day dissolves',detail:'An endless horizon. One last swim.',alt:'Stone villa and infinity pool overlooking the sea at sunset'},
];

export function RetreatIntro(){
  const section=useRef<HTMLElement>(null);
  useEffect(()=>{
    const node=section.current;if(!node)return;
    const observer=new IntersectionObserver(([entry])=>{
      node.dataset.entered=String(entry.isIntersecting);
    },{threshold:.35});
    observer.observe(node);return()=>observer.disconnect();
  },[]);
  return <section ref={section} id="retreat" className="retreat-composition">
    <div className="retreat-collection">
      <p className="retreat-collection-title">A slower kind of somewhere.</p>
      <div className="retreat-pair">
        <figure className="retreat-card">
          <Image src="/images/retreat-terrace.png" alt="Linen loungers beside a limestone villa and infinity pool at sunset" fill sizes="(max-width: 700px) 43vw, 24vw" quality={90}/>
          <figcaption><span>The terrace</span><small>Salt in the air.</small></figcaption>
        </figure>
        <figure className="retreat-card">
          <Image src="/images/retreat-villa.png" alt="Warmly lit coastal villa overlooking still pool water and the evening sea" fill sizes="(max-width: 700px) 43vw, 30vw" quality={90}/>
          <figcaption><span>The slow hours</span><small>Space to hear yourself again.</small></figcaption>
        </figure>
      </div>
    </div>
    <div className="retreat-message">
      <span className="eyebrow">01 — THE RETREAT</span>
      <h2 className="retreat-title" aria-label="A little less world. A little more you.">
        <span className="retreat-verse" aria-hidden="true"><span>A little less world.</span></span>
        <span className="retreat-verse" aria-hidden="true"><span>A little more</span></span>
        <span className="retreat-verse" aria-hidden="true"><span><em className="retreat-you">you.</em></span></span>
      </h2>
      <p className="retreat-whisper">Salt in the air. Space to hear yourself again.</p>
    </div>
  </section>
}

export function DepthGallery({onOpen}:{onOpen:(index:number)=>void}){
  const [active,setActive]=useState(0);
  const gallery=useRef<HTMLElement>(null);
  useEffect(()=>{const node=gallery.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>{node.dataset.inView=String(entry.isIntersecting)},{rootMargin:'80px'});observer.observe(node);return()=>observer.disconnect()},[]);
  const touch=useRef<{x:number;y:number}|null>(null);
  function advance(amount:number){setActive(current=>(current+amount+photographs.length)%photographs.length)}
  return <section ref={gallery} className="depth-gallery" id="spaces" aria-roledescription="carousel" aria-label="Explore the spaces" onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();advance(1)}if(event.key==='ArrowLeft'){event.preventDefault();advance(-1)}}}>
    <div className="depth-heading section-gutter reveal"><span className="eyebrow">02 — ROOM TO EXHALE</span><h2>Space to <em>simply be.</em></h2><p>A few places you might lose track of time.</p></div>
    <div className="depth-stage reveal" onTouchStart={event=>{touch.current={x:event.touches[0].clientX,y:event.touches[0].clientY}}} onTouchEnd={event=>{if(!touch.current)return;const dx=event.changedTouches[0].clientX-touch.current.x;const dy=event.changedTouches[0].clientY-touch.current.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)advance(dx<0?1:-1);touch.current=null}}>
      {photographs.map((photo,index)=>{const offset=((index-active+7)%5)-2;return <button key={photo.image} className={`depth-slide ${offset===0?'is-active':''}`} data-offset={offset} data-active={offset===0} style={{'--offset':offset} as CSSProperties} aria-label={offset===0?`View ${photo.title} photograph`:`Show ${photo.title}`} aria-current={offset===0?'true':undefined} tabIndex={Math.abs(offset)<2?0:-1} onClick={()=>offset===0?onOpen(index):setActive(index)}>
        <div className="depth-photo"><Image src={photo.image} alt={photo.alt} fill sizes="(max-width: 700px) 66vw, 32vw" quality={90}/></div><span className="depth-open" aria-hidden="true">↗</span>
      </button>})}
    </div>
    <div className="depth-controls"><button className="depth-arrow" aria-label="Previous photograph" onClick={()=>advance(-1)}>←</button><div className="depth-caption" aria-live="polite" aria-atomic="true"><span className="depth-count">0{active+1} <span>/ 05</span></span><h3>{photographs[active].title}</h3><p>{photographs[active].detail}</p></div><button className="depth-arrow" aria-label="Next photograph" onClick={()=>advance(1)}>→</button></div>
    <span className="depth-hint">EXPLORE SLOWLY. STAY A LITTLE LONGER.</span>
  </section>
}
