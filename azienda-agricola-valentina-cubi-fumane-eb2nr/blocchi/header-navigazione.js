// Menu a pulsante su telefono, header solido dopo lo scroll, evidenzia la sezione visibile.
export default function init(radice, ctx) {
  const btn = radice.querySelector('.b-nav__apri');
  const pannello = radice.querySelector('.b-nav__pannello');
  const links = [...radice.querySelectorAll('.b-nav__link')];
  const mq = matchMedia('(max-width: 899px)');
  const pulizie = [];
  const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); pulizie.push(() => el.removeEventListener(ev, fn, opt)); };

  // Pulsante visibile solo se c'e' JS (senza JS il menu resta aperto e funzionante)
  btn.hidden = false;
  const imposta = (aperto, ridaiFocus) => {
    btn.setAttribute('aria-expanded', String(aperto));
    pannello.classList.toggle('b-nav__pannello--aperto', aperto);
    document.body.style.overflow = aperto && mq.matches ? 'hidden' : '';
    if (ctx?.lenis) aperto && mq.matches ? ctx.lenis.stop() : ctx.lenis.start();
    if (!aperto && ridaiFocus) btn.focus();
  };
  imposta(false);
  on(btn, 'click', () => imposta(btn.getAttribute('aria-expanded') !== 'true'));
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') imposta(false, true);
  });
  // chiude dopo aver scelto una voce
  on(pannello, 'click', (e) => { if (e.target.closest('a[href^="#"]')) imposta(false); });
  // tornando a desktop il pannello torna in linea
  on(mq, 'change', () => imposta(false));

  // Header solido dopo lo scroll
  const solido = () => radice.classList.toggle('b-nav--solido', scrollY > 40);
  on(window, 'scroll', solido, { passive: true });
  solido();

  // Sezione corrente (aria-current)
  const mappa = new Map();
  links.forEach((a) => {
    const id = (a.getAttribute('href') || '').replace(/^#/, '');
    const sez = id && document.getElementById(id);
    if (sez) mappa.set(sez, a);
  });
  let io = null;
  if (mappa.size && 'IntersectionObserver' in window) {
    io = new IntersectionObserver((voci) => {
      voci.forEach((v) => {
        if (!v.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        mappa.get(v.target).setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    mappa.forEach((_, sez) => io.observe(sez));
  }

  return () => { pulizie.forEach((f) => f()); io?.disconnect(); document.body.style.overflow = ''; };
}
