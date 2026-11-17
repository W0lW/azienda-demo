/* Adattato da "parallax-hero" di GSAP Vault (https://gsapvault.com)
   MIT License - Copyright (c) 2026 GSAP Vault. Vedi LICENSE-gsap-vault.txt.

   Hero a strati: ogni strato [data-vel] si sposta di (1 - velocita) * distanza durante
   lo scroll. Velocita < 1 = sullo sfondo, > 1 = in primo piano. Nessuna libreria propria:
   usa solo gsap/ScrollTrigger del runtime. */
export default function init(radice, { gsap, riduciMovimento, mobile }) {
  if (riduciMovimento) return; // scena ferma e completa

  const strati = [...radice.querySelectorAll('[data-vel]')];
  const riempi = radice.querySelector('[data-riempi]');
  const distanza = mobile ? 128 : 236;
  const corsa = mobile ? 340 : 560;
  const velocita = (el) => {
    const v = parseFloat(el.dataset.vel);
    return Number.isFinite(v) ? v : 1;
  };

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      defaults: { duration: 1, ease: 'none', force3D: true },
      scrollTrigger: {
        trigger: radice, start: 'top top', end: () => '+=' + corsa,
        pin: true, scrub: mobile ? 0.35 : 0.5, invalidateOnRefresh: true,
      },
    });
    strati.forEach((el) => {
      const a = { y: (1 - velocita(el)) * distanza };
      const scala = parseFloat(el.dataset.scala);
      const sfoca = parseFloat(el.dataset.sfoca);
      const opa = parseFloat(el.dataset.opacita);
      if (Number.isFinite(scala)) a.scale = scala;
      if (Number.isFinite(sfoca) && !mobile) a.filter = `blur(${sfoca}px)`;
      if (Number.isFinite(opa)) a.autoAlpha = opa;
      tl.to(el, a, 0);
    });
    if (riempi) tl.to(riempi, { scaleX: 1 }, 0);

    // Ingresso del titolo: solo movimento, MAI opacity 0 (e' l'LCP: resta visibile da CSS)
    gsap.from(radice.querySelectorAll('.b-hpar__occhiello, .b-hpar__titolo'), {
      y: 30, duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.2,
    });

    // Deriva col mouse (solo puntatore fine, desktop): gli strati si muovono in senso opposto
    const mm = gsap.matchMedia();
    mm.add('(hover: hover) and (pointer: fine) and (min-width: 768px)', () => {
      const forza = 1.6;
      const molle = strati.map((el) => ({
        d: velocita(el) - 1,
        x: gsap.quickTo(el, 'xPercent', { duration: 1.1, ease: 'power3' }),
        y: gsap.quickTo(el, 'yPercent', { duration: 1.1, ease: 'power3' }),
      }));
      const muovi = (e) => {
        const r = radice.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        molle.forEach((m) => { m.x(-nx * m.d * forza); m.y(-ny * m.d * forza * 0.6); });
      };
      const esci = () => molle.forEach((m) => { m.x(0); m.y(0); });
      radice.addEventListener('pointermove', muovi);
      radice.addEventListener('pointerleave', esci);
      return () => {
        radice.removeEventListener('pointermove', muovi);
        radice.removeEventListener('pointerleave', esci);
      };
    });
  }, radice);

  return () => ctx.revert();
}
