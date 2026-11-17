// Mostra la barra dopo l'hero; la nasconde sopra i contatti e sul footer.
export default function init(radice) {
  const hero = document.querySelector('main > [data-blocco]:not([data-blocco="header-navigazione"])');
  const fine = document.getElementById(radice.dataset.fine || 'contatti');
  const footer = document.querySelector('footer');
  const nascondi = (s) => radice.classList.toggle('b-chiama--nascosta', s);
  nascondi(true);
  let attesa = false;
  const calcola = () => {
    attesa = false;
    const h = innerHeight;
    const dopoHero = !hero || hero.getBoundingClientRect().bottom < h * 0.25;
    const su = (el) => el && el.getBoundingClientRect().top < h && el.getBoundingClientRect().bottom > 0;
    nascondi(!dopoHero || su(fine) || su(footer));
  };
  const richiedi = () => { if (!attesa) { attesa = true; requestAnimationFrame(calcola); } };
  addEventListener('scroll', richiedi, { passive: true });
  addEventListener('resize', richiedi);
  calcola();
  return () => { removeEventListener('scroll', richiedi); removeEventListener('resize', richiedi); };
}
