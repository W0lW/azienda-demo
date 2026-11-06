/* Logica ispirata a "qr-menu-template" di GSAP Vault (https://gsapvault.com)
   MIT License - Copyright (c) 2026 GSAP Vault. Vedi LICENSE-gsap-vault.txt.

   Tab per categoria + filtri alimentari + dettagli a comparsa.
   Senza JS la carta resta intera (tutte le categorie impilate). */
export default function init(radice, { gsap, ScrollTrigger, riduciMovimento }) {
  const tabs = [...radice.querySelectorAll('[role="tab"]')];
  const gruppi = [...radice.querySelectorAll('[data-gruppo]')];
  const piatti = [...radice.querySelectorAll('[data-piatto]')];
  const chips = [...radice.querySelectorAll('.b-menu__filtri [data-dieta]')];
  const vuoto = radice.querySelector('[data-vuoto]');
  if (!tabs.length || !gruppi.length) return;

  radice.classList.add('b-menu--js');
  const aggiorna = () => ScrollTrigger.refresh();
  const attive = [];
  let corrente = 0; // 0 = Tutto
  let anim = null;

  // ---- tab ----
  function ricalcolaVuoti() {
    let visibili = 0;
    gruppi.forEach((g, i) => {
      const inVista = corrente === 0 || corrente === i + 1;
      const n = g.querySelectorAll('[data-piatto]:not(.is-filtrato)').length;
      g.classList.toggle('is-vuoto', n === 0 && attive.length > 0);
      if (inVista) visibili += n;
    });
    if (vuoto) vuoto.hidden = visibili > 0;
  }
  function seleziona(i, anima) {
    corrente = i;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.classList.toggle('is-attivo', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    gruppi.forEach((g, k) => g.classList.toggle('is-attivo', i === 0 || i === k + 1));
    ricalcolaVuoti();
    if (anim) anim.kill();
    if (anima && !riduciMovimento) {
      const righe = radice.querySelectorAll('.b-menu__gruppo.is-attivo [data-piatto]:not(.is-filtrato)');
      anim = gsap.fromTo(righe, { opacity: 0, y: 10 }, {
        opacity: 1, y: 0, duration: 0.45, ease: 'power2.out',
        stagger: Math.min(0.05, 0.6 / (righe.length || 1)), clearProps: 'transform,opacity',
      });
    }
    aggiorna();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => seleziona(i, true));
    t.addEventListener('keydown', (e) => {
      const n = tabs.length;
      const k = { ArrowRight: (i + 1) % n, ArrowDown: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      seleziona(k, true);
      tabs[k].focus();
    });
  });

  // ---- filtri (piu' chip = AND) ----
  chips.forEach((c) => c.addEventListener('click', () => {
    const d = c.dataset.dieta;
    const k = attive.indexOf(d);
    if (k === -1) attive.push(d); else attive.splice(k, 1);
    c.setAttribute('aria-pressed', String(k === -1));
    piatti.forEach((p) => {
      const ok = attive.every((a) => (p.dataset.dieta || '').split(/\s+/).includes(a));
      p.classList.toggle('is-filtrato', !ok);
    });
    ricalcolaVuoti();
    aggiorna();
  }));

  // ---- dettagli a comparsa ----
  piatti.forEach((p, i) => {
    const bottone = p.querySelector('[data-apri]');
    const piu = p.querySelector('[data-piu]');
    if (!bottone || !piu) return;
    piu.id = piu.id || `b-menu-piu-${i}`;
    bottone.setAttribute('aria-controls', piu.id);
    bottone.setAttribute('aria-expanded', 'false');
    bottone.addEventListener('click', () => {
      const apri = !p.classList.contains('is-aperto');
      p.classList.toggle('is-aperto', apri);
      bottone.setAttribute('aria-expanded', String(apri));
      const a = { height: apri ? 'auto' : 0, opacity: apri ? 1 : 0 };
      if (riduciMovimento) { gsap.set(piu, a); aggiorna(); }
      else gsap.to(piu, { ...a, duration: 0.35, ease: 'power2.out', onComplete: aggiorna });
    });
  });

  seleziona(1 <= gruppi.length ? 1 : 0, false); // parte dalla prima categoria

  return () => { if (anim) anim.kill(); radice.classList.remove('b-menu--js'); };
}
