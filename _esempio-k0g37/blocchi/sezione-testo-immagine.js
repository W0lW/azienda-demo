// Immagine che si apre a sipario + zoom interno lento
export default function init(radice, { gsap, riduciMovimento }) {
  if (riduciMovimento) return;
  const figura = radice.querySelector('.b-ti__figura');
  const img = radice.querySelector('.b-ti__img');
  const daSinistra = radice.classList.contains('b-ti--inverti');

  gsap.fromTo(figura,
    { clipPath: daSinistra ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' },
    { clipPath: 'inset(0 0% 0 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: figura, start: 'top 80%' } });

  gsap.fromTo(img, { scale: 1.25 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: radice, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}
