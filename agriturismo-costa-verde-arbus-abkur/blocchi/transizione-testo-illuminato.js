/* Adattato da "scroll-text-highlight" di GSAP Vault (https://gsapvault.com)
   MIT License - Copyright (c) 2026 GSAP Vault. Vedi LICENSE-gsap-vault.txt.

   Ogni parola: appare dal "fantasma" (opaca poco), sale, lampeggia nell'accento e si assesta
   nel colore del testo, in sequenza legata allo scroll. */
export default function init(radice, { gsap, riduciMovimento, tema }) {
  const p = radice.querySelector('.b-illu__testo');
  if (!p || riduciMovimento) return;

  const testo = p.textContent.replace(/\s+/g, ' ').trim();
  p.textContent = '';
  const parole = testo.split(' ').map((w, i, tutte) => {
    const s = document.createElement('span');
    s.className = 'b-illu__parola';
    s.textContent = w;
    p.append(s);
    if (i < tutte.length - 1) p.append(' ');
    return s;
  });

  const base = getComputedStyle(p).color;
  const accento = tema.accento || base;
  const BORDO = 0.16, LAMPO = 0.28, ASSESTA = 0.72, SOLLEVA = 7;

  const ctx = gsap.context(() => {
    gsap.set(parole, { opacity: 0.4, y: SOLLEVA });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 55%', scrub: true, invalidateOnRefresh: true },
    });
    parole.forEach((w, i) => {
      tl.to(w, { opacity: 1, y: -SOLLEVA * 0.45, color: accento, duration: BORDO }, i)
        .to(w, { y: -SOLLEVA, duration: LAMPO }, i + BORDO)
        .to(w, { y: 0, color: base, duration: ASSESTA }, i + BORDO + LAMPO);
    });
  }, radice);

  return () => { ctx.revert(); p.textContent = testo; };
}
