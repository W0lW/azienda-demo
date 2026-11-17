/* ==========================================================
   BASE STANDARD DELL'AGENZIA – runtime.js
   Unico motore per tutti i blocchi:
   - scroll fluido (Lenis) sincronizzato con GSAP ScrollTrigger
   - rileva telefono, WebGL e "riduci movimento"
   - avvia il JS di ogni blocco passandogli il contesto comune
   Un blocco esporta:  export default function init(radice, ctx) { … return pulizia }
   ========================================================== */
// three.js NON si carica all'avvio: i blocchi 3D chiamano `await ctx.carica3d()`
// (import dinamico: H1/hero non aspettano il 3D). RGBELoader tolto dal contesto:
// se serve, il blocco lo importa con import('three/addons/loaders/RGBELoader.js').
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
const riduciMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 767px)').matches;
const webgl = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
})();

html.classList.add('js');
html.classList.toggle('js-movimento', !riduciMovimento);
html.classList.toggle('no-webgl', !webgl);

// Scroll fluido solo se il movimento è consentito
let lenis = null;
if (!riduciMovimento) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Legge i colori del tema (servono anche alla scena 3D)
const stile = getComputedStyle(html);
const tema = Object.fromEntries(
  ['sfondo', 'sfondo-2', 'testo', 'testo-2', 'accento', 'luce'].map((k) => [k, stile.getPropertyValue(`--c-${k}`).trim()])
);

// Animazione standard per gli elementi con [data-rivela] (riusabile da tutti i blocchi)
function rivela(radice) {
  if (riduciMovimento) return;
  radice.querySelectorAll('[data-rivela]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.1, ease: 'expo.out',
      delay: Number(el.dataset.rivela) || 0,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

let _3d = null;
function carica3d() {
  return _3d ||= Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/environments/RoomEnvironment.js'),
  ]).then(([THREE, g, r]) => {
    Object.assign(ctx, { THREE, GLTFLoader: g.GLTFLoader, RoomEnvironment: r.RoomEnvironment });
    return ctx;
  });
}

const ctx = { carica3d, gsap, ScrollTrigger, lenis, tema, riduciMovimento, mobile, webgl, rivela };
window.__agenzia = ctx; // utile per il debug in console

const elenco = JSON.parse(document.getElementById('blocchi-js')?.textContent || '[]');
// Avvio lazy: i blocchi nella prima schermata partono subito, gli altri quando
// si avvicinano al viewport (IntersectionObserver): meno lavoro all'avvio.
const avvii = [];
let avviatiTardi = false, timerRefresh = 0;
function avvia(id, js, radice) {
  const p = import(js).then((m) => {
    try { m.default?.(radice, ctx); } catch (e) { console.error(`[blocco ${id}]`, e); }
    rivela(radice);
    if (avviatiTardi) { // blocco avviato dopo l'avvio: un solo ricalcolo, a riposo
      clearTimeout(timerRefresh);
      timerRefresh = setTimeout(() => ScrollTrigger.refresh(), 250);
    }
  });
  avvii.push(p);
}
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((voci) => voci.forEach((v) => {
      if (!v.isIntersecting) return;
      io.unobserve(v.target);
      avvia(v.target.__avvio.id, v.target.__avvio.js, v.target);
    }), { rootMargin: '900px 0px' })
  : null;
for (const { id, js } of elenco) {
  document.querySelectorAll(`[data-blocco="${id}"]`).forEach((r) => {
    if (!io || r.getBoundingClientRect().top < innerHeight * 1.2) avvia(id, js, r);
    else { r.__avvio = { id, js }; io.observe(r); }
  });
}
document.querySelectorAll('[data-blocco]').forEach((r) => {
  if (!elenco.some((b) => b.id === r.dataset.blocco)) rivela(r); // blocchi senza JS
});

Promise.allSettled(avvii).then(() => {
  html.classList.add('pronto');
  avviatiTardi = true;
});
// refresh finale a riposo, fuori dal percorso critico
addEventListener('load', () => (window.requestIdleCallback || setTimeout)(() => ScrollTrigger.refresh(), { timeout: 2000 }));

// Link interni con scroll fluido
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || !lenis) return;
  const dest = document.querySelector(a.getAttribute('href'));
  if (dest) { e.preventDefault(); lenis.scrollTo(dest, { offset: 0, duration: 1.4 }); }
});
