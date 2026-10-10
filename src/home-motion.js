export async function createHomeMotion(root, isActive) {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'), import('gsap/ScrollTrigger'),
  ]);
  if (!isActive()) return () => {};
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    root.dataset.motion = 'gsap';
    const context = gsap.context(() => {
      gsap.from('.rn-hero-copy > *', {y:22,opacity:0,duration:.8,stagger:.07,ease:'power3.out',clearProps:'all'});
      gsap.from('.rn-hero-product img', {opacity:0,duration:1,delay:.2,ease:'power3.out',clearProps:'all'});
      root.querySelectorAll('.rn-reveal').forEach(element => {
        gsap.from(element, {y:38,opacity:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 92%',once:true},clearProps:'all'});
      });
      gsap.from('.rn-benefits article', {y:28,opacity:0,stagger:.15,duration:.7,scrollTrigger:{trigger:'.rn-benefits',start:'top 88%',once:true},clearProps:'all'});
    }, root);
    return () => {context.revert();delete root.dataset.motion;};
  });
  media.add('(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)', () => {
    const hero=root.querySelector('.rn-hero');
    const screen=root.querySelector('.rn-hero-product');
    const copy=root.querySelector('.rn-hero-copy');
    const context=gsap.context(() => {
      // Keep the full captured screen inside the pinned viewport at both ends.
      const timeline=gsap.timeline({scrollTrigger:{id:'relaynest-hero',trigger:hero,start:'top 76px',end:()=>`+=${Math.round(innerHeight*.7)}`,pin:true,scrub:.8,anticipatePin:1,invalidateOnRefresh:true}});
      timeline.to(copy,{y:-48,opacity:0,ease:'none',duration:.45},0)
        .to(screen,{y:()=>-Math.min(120,hero.clientHeight*.2),scale:()=>Math.min(1.55,(hero.clientHeight-65)/screen.offsetHeight),ease:'none',duration:1},0)
        .to(hero,{backgroundColor:'#35443c',ease:'none',duration:1},0);
    },root);
    return ()=>context.revert();
  });
  const refresh=()=>ScrollTrigger.refresh();
  root.querySelectorAll('img').forEach(img=>img.addEventListener('load',refresh));
  document.fonts.ready.then(()=>{if(isActive())refresh();});
  return ()=>{
    root.querySelectorAll('img').forEach(img=>img.removeEventListener('load',refresh));
    media.revert();
  };
}
