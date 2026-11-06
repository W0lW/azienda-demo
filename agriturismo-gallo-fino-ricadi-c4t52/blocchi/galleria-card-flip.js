/* Adattato da "3d-card-flip" di GSAP Vault (https://gsapvault.com)
   MIT License - Copyright (c) 2026 GSAP Vault. Vedi LICENSE-gsap-vault.txt.

   Rotazione in CSS; qui: tocco/tastiera (una carta aperta alla volta), Esc, entrata a cascata. */
export default function init(radice, { gsap, riduciMovimento }) {
  const griglia = radice.querySelector('.b-flip__griglia');
  const carte = [...radice.querySelectorAll('[data-carta]')];
  if (!griglia || !carte.length) return;
  const conHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const imposta = (carta, aperta) => {
    carta.classList.toggle('is-girata', aperta);
    carta.setAttribute('aria-pressed', String(aperta));
    griglia.classList.toggle('ha-aperta', carte.some((c) => c.classList.contains('is-girata')));
  };
  const alterna = (carta) => {
    const apri = !carta.classList.contains('is-girata');
    if (apri) carte.forEach((c) => c !== carta && imposta(c, false));
    imposta(carta, apri);
  };

  carte.forEach((c) => {
    c.addEventListener('click', () => { if (!conHover) alterna(c); });
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alterna(c); }
    });
  });
  const esc = (e) => { if (e.key === 'Escape') carte.forEach((c) => imposta(c, false)); };
  document.addEventListener('keydown', esc);

  let tween = null;
  if (!riduciMovimento) {
    tween = gsap.from(carte, {
      y: 52, rotationX: -8, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1,
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: griglia, start: 'top 90%', once: true },
    });
  }

  return () => {
    document.removeEventListener('keydown', esc);
    if (tween) { tween.scrollTrigger?.kill(); tween.kill(); }
  };
}
