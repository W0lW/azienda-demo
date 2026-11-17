// Hero cinematografico: rivelazione del titolo parola per parola + uscita in profondità allo scroll
export default function init(radice, { gsap, riduciMovimento }) {
  const titolo = radice.querySelector('.b-hero__titolo');
  const media = radice.querySelector('.b-hero__sfondo');
  const contenuto = radice.querySelector('.b-hero__contenuto');

  // Divide il titolo in parole (il testo resta leggibile per SEO e screen reader)
  const testo = titolo.textContent.trim();
  titolo.setAttribute('aria-label', testo);
  titolo.textContent = '';
  testo.split(/\s+/).forEach((p, i) => {
    const esterno = document.createElement('span');
    esterno.className = 'parola';
    esterno.setAttribute('aria-hidden', 'true');
    const interno = document.createElement('span');
    interno.textContent = p;
    esterno.append(interno);
    if (i) titolo.append(' ');
    titolo.append(esterno);
  });

  if (riduciMovimento) return;

  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from(media, { scale: 1.15, opacity: 0, duration: 2.4, ease: 'power2.out' }, 0)
    .from(titolo.querySelectorAll('.parola > span'), { yPercent: 110, duration: 1.4, stagger: 0.08 }, 0.3)
    .from(radice.querySelectorAll('.b-hero__occhiello, .b-hero__sotto, .b-hero__cta'), { opacity: 0, y: 20, duration: 1.2, stagger: 0.12 }, 0.8);

  // Allo scroll: lo sfondo scende lento (parallasse), il testo si allontana
  gsap.timeline({ scrollTrigger: { trigger: radice, start: 'top top', end: 'bottom top', scrub: true } })
    .to(media, { yPercent: 12, scale: 1.08, ease: 'none' }, 0)
    .to(contenuto, { yPercent: -25, opacity: 0, scale: 0.96, ease: 'none' }, 0);
}
