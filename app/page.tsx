'use client';

import Image from 'next/image';
import {RetreatIntro,DepthGallery,photographs} from './retreat';
import {useEffect,useRef,useState} from 'react';

const scenes = [
  {time:'21:00',label:'After dark',title:'Stay in.\nLet the world wait.',description:'Soft linen. Amber light. Nowhere else you need to be.',image:'/images/bedroom.png',alt:'Warm stone bedroom with soft linen and amber lamps at dusk'},
  {time:'07:30',label:'Slow mornings',title:'Nothing between\nyou and the sea.',description:'Coffee, an open door, a quiet shore. Let the morning find its own rhythm.',image:'/images/pavilion.png',alt:'Open Mediterranean coastal pavilion overlooking the sea in morning light'},
  {time:'18:45',label:'Golden hour',title:'Let the day\ndissolve into gold.',description:'One last swim. A sky that changes everything. Just be here.',image:'/images/hero.png',alt:'Cliffside coastal villa and infinity pool overlooking the sea at sunset'},
];
function Arrow({diagonal=false}:{diagonal?:boolean}){return <span aria-hidden="true">{diagonal?'↗':'↗'}</span>}
export default function Home(){
  const [heroEyebrow,setHeroEyebrow]=useState('A SLOWER STATE OF BEING');
  const [menu,setMenu]=useState(false);
  const [paused,setPaused]=useState(false);
  const [scene,setScene]=useState(2);
  const [lightbox,setLightbox]=useState<number|null>(null);
  const [stay,setStay]=useState(false);
  const [saved,setSaved]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const viewer=useRef<HTMLDialogElement>(null);
  const hero=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!menu)return;
    const panel=document.getElementById('mobile-menu');
    const items=panel?.querySelectorAll<HTMLElement>('a,button');
    const toggle=document.querySelector<HTMLElement>('.menu-toggle');
    items?.[0]?.focus();
    function key(event:KeyboardEvent){
      if(event.key==='Escape'){setMenu(false);toggle?.focus()}
      if(event.key==='Tab'&&items){const first=items[0],last=items[items.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();toggle?.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();toggle?.focus()}
        else if(document.activeElement===toggle){event.preventDefault();(event.shiftKey?last:first).focus()}
      }
    }
    document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);
  },[menu]);
  useEffect(()=>{document.documentElement.dataset.motion=paused?'paused':'playing'},[paused]);
  useEffect(()=>{
    let active=true;
    fetch('/api/cms/home')
      .then(response=>response.ok?response.json():null)
      .then(data=>{if(active&&typeof data?.heroEyebrow==='string')setHeroEyebrow(data.heroEyebrow)})
      .catch(()=>{});
    return()=>{active=false};
  },[]);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:0.08});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));return()=>observer.disconnect();
  },[]);
  useEffect(()=>{if(stay)dialog.current?.showModal();else dialog.current?.close()},[stay]);
  useEffect(()=>{if(lightbox!==null)viewer.current?.showModal();else viewer.current?.close()},[lightbox]);
  useEffect(()=>{document.body.style.overflow=stay||lightbox!==null||menu?'hidden':'';return()=>{document.body.style.overflow=''}},[stay,lightbox,menu]);
  function download(){
    const text=`DHAMNA — An imagined escape\n\nYour chosen mood: ${scenes[scene].label}\n\n07:30 — Let the morning arrive. Coffee, soft linen, an open window.\n15:00 — Spend an unhurried afternoon by the water.\n18:45 — One last swim as the sky turns gold.\n\nDHAMNA is a fictional design concept. This is an inspiration itinerary, not a reservation or a real property listing.\nDiscover real stays at https://www.airbnb.com/\n`;
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='A-day-at-DHAMNA.txt';a.click();URL.revokeObjectURL(url);setSaved(true);
  }
  return <>
    <a className="skip-link" href="#retreat">Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="DHAMNA home">DHAMNA<span>A COASTAL STATE OF MIND</span></a>
      <nav className="desktop-nav" aria-label="Main navigation"><a href="#retreat">The retreat</a><a href="#spaces">The spaces</a><a href="#rhythm">The slow life</a></nav>
      <button className="nav-stay" onClick={()=>setStay(true)}>Imagine your stay <Arrow/></button>
      <button className={`menu-toggle ${menu?'active':''}`} aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu} aria-controls="mobile-menu" onClick={()=>setMenu(!menu)}><span/><span/></button>
    </header>
    {menu&&<nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation"><span className="eyebrow">A LITTLE CLOSER</span>{[['The retreat','retreat'],['The spaces','spaces'],['The slow life','rhythm']].map(([label,id])=><a key={id} href={`#${id}`} onClick={()=>setMenu(false)}>{label}<Arrow/></a>)}<button onClick={()=>{setMenu(false);setStay(true)}}>Imagine your stay <Arrow/></button><p>Less noise. More you.</p></nav>}
    <noscript><nav className="noscript-nav"><a href="#retreat">The retreat</a><a href="#spaces">The spaces</a><a href="#rhythm">The slow life</a><a href="https://www.airbnb.com/">Browse real stays on Airbnb</a></nav></noscript><main>
      <section className="hero" id="home" ref={hero} onPointerMove={e=>{if(paused||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const rect=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--pointer-x',`${((e.clientX-rect.left)/rect.width-.5)*10}px`);e.currentTarget.style.setProperty('--pointer-y',`${((e.clientY-rect.top)/rect.height-.5)*6}px`)}}>
        <div className="hero-camera"><Image src="/images/hero.png" alt="An imagined stone villa with a glowing infinity pool on a quiet coastline at sunset" fill priority sizes="100vw" quality={90}/></div>
        <div className="hero-shade"/><div className="light-wash"/>
        <div className="hero-copy"><div className="eyebrow hero-kicker"><span className="tiny-sun"/> {heroEyebrow}</div><h1>Somewhere,<br/><em>closer to yourself.</em></h1><p>A quiet hideaway. An endless horizon.<br/>The luxury of simply being.</p><a className="hero-explore" href="#retreat">Discover DHAMNA <span aria-hidden="true">↓</span></a></div>
        <div className="hero-bottom"><span>THE COAST IS CALLING</span><span className="hero-bottom-center">A place to do a little less. And feel a little more.</span><button className="motion-button" onClick={()=>setPaused(!paused)} aria-pressed={paused} aria-label={paused?'Play ambient motion':'Pause ambient motion'}><span aria-hidden="true">{paused?'▷':'Ⅱ'}</span>{paused?'Play motion':'Pause motion'}</button></div>
        <span className="hero-side">SALT IN THE AIR. SPACE IN YOUR DAY.</span>
      </section>
      <RetreatIntro/>
      <DepthGallery onOpen={setLightbox}/>
      <section className="rhythm" id="rhythm"><div className="rhythm-heading section-gutter reveal"><span className="eyebrow">03 — ON YOUR OWN TIME</span><h2>A day with <em>no agenda.</em></h2><p>Follow the light. Find your moment.</p></div><div className="day-scene"><div className="scene-images">{scenes.map((s,i)=><div key={s.label} className={`scene-image ${scene===i?'selected':''}`} aria-hidden={scene!==i}><Image src={s.image} alt={s.alt} fill sizes="100vw" quality={85}/></div>)}</div><div className="scene-shade"/><div className="scene-copy" key={scene}><span className="eyebrow">{scenes[scene].time} — {scenes[scene].label.toUpperCase()}</span><h3>{scenes[scene].title.split('\n').map((line,i)=><span key={line}>{i===1?<em>{line}</em>:line}<br/></span>)}</h3><p>{scenes[scene].description}</p></div><div className="day-orbit" aria-hidden="true"><div className="orbit-line"/><span style={{left:`${18+[2,0,1][scene]*32}%`,bottom:`${scene===2?58:29}px`}}/><small>THE WORLD CAN WAIT</small></div><div className="scene-selector" role="group" aria-label="Choose a moment of the day">{[1,2,0].map(i=>{const s=scenes[i];return <button key={s.time} aria-pressed={scene===i} onClick={()=>setScene(i)}><span className="time">{s.time}</span><span>{s.label}</span><span className="scene-dot" aria-hidden="true"/></button>})}</div></div></section>
      <section className="invitation section-gutter"><div className="invitation-top"><span className="eyebrow">STAY A LITTLE CLOSER</span><span aria-hidden="true">✳</span></div><div className="invitation-main reveal"><h2>Less noise.<br/><em>More you.</em></h2><div><p>For the days you want to get away.<br/>And the feeling you want to come back to.</p><button className="cream-button" onClick={()=>setStay(true)}>Imagine your stay <Arrow/></button><span className="invitation-note">YOUR NEXT CHAPTER, AT YOUR OWN PACE.</span></div></div><footer><a href="#home" className="footer-logo">DHAMNA</a><p>An imagined coastal retreat.<br/>A real invitation to slow down.</p><div><a href="#spaces">Explore the spaces <Arrow/></a><span>FICTIONAL RETREAT · DESIGN CONCEPT</span></div></footer></section>
    </main>
    <dialog ref={dialog} className="stay-dialog" aria-labelledby="stay-heading" onCancel={()=>setStay(false)} onClick={e=>{if(e.target===e.currentTarget)setStay(false)}}><div className="stay-dialog-inner"><button className="close-button" onClick={()=>setStay(false)} aria-label="Close stay preview">×</button><span className="eyebrow">A LITTLE ESCAPE, IMAGINED</span><h2 id="stay-heading">Your slower<br/><em>state of mind.</em></h2><p className="chosen-mood">YOUR MOMENT <span>{scenes[scene].time} · {scenes[scene].label}</span></p><p>DHAMNA is a fictional retreat, created to inspire. There is no property to book here, but you can take a little of this feeling with you.</p><button className="olive-button" onClick={download}>{saved?'Download your day again':'Save your imagined day'} <span aria-hidden="true">↓</span></button><span className="download-status" role="status">{saved?'Your inspiration itinerary is ready.':''}</span><a className="airbnb-link" href="https://www.airbnb.com/" target="_blank" rel="noopener noreferrer">Discover real stays on Airbnb <Arrow/></a><small>Opens Airbnb’s homepage, not an official DHAMNA listing.</small></div></dialog>
    <dialog ref={viewer} className="lightbox" aria-label="DHAMNA photograph viewer" onCancel={()=>setLightbox(null)} onClick={e=>{if(e.target===e.currentTarget)setLightbox(null)}}><button className="close-button" onClick={()=>setLightbox(null)} aria-label="Close photograph">×</button>{lightbox!==null&&<><div className="lightbox-image"><Image src={photographs[lightbox].image} alt={photographs[lightbox].alt} fill sizes="90vw" quality={95}/></div><div className="lightbox-caption"><span>{lightbox===0?'The quiet room':'At the water’s edge'}</span><span>DHAMNA — AN IMAGINED ESCAPE</span></div></>}</dialog>
  </>
}
