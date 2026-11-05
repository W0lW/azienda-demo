/* ==========================================================
   BASE STANDARD DELL'AGENZIA – runtime.js
   Unico motore per tutti i blocchi:
   - scroll fluido (Lenis) sincronizzato con GSAP ScrollTrigger
   - rileva telefono, WebGL e "riduci movimento"
   - avvia il JS di ogni blocco passandogli il contesto comune
   Un blocco esporta:  export default function init(radice, ctx) { … return pulizia }
   ========================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
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

const ctx = { THREE, GLTFLoader, RoomEnvironment, gsap, ScrollTrigger, lenis, tema, riduciMovimento, mobile, webgl, rivela };
window.__agenzia = ctx; // utile per il debug in console

const elenco = JSON.parse(document.getElementById('blocchi-js')?.textContent || '[]');
const avvii = [];
for (const { id, js } of elenco) {
  const radici = document.querySelectorAll(`[data-blocco="${id}"]`);
  if (!radici.length) continue;
  avvii.push(
    import(js).then((m) => radici.forEach((r) => {
      try { m.default?.(r, ctx); } catch (e) { console.error(`[blocco ${id}]`, e); }
    }))
  );
}
document.querySelectorAll('[data-blocco]').forEach(rivela);

Promise.allSettled(avvii).then(() => {
  ScrollTrigger.refresh();
  html.classList.add('pronto');
});
addEventListener('load', () => ScrollTrigger.refresh());

// Link interni con scroll fluido
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || !lenis) return;
  const dest = document.querySelector(a.getAttribute('href'));
  if (dest) { e.preventDefault(); lenis.scrollTo(dest, { offset: 0, duration: 1.4 }); }
});
