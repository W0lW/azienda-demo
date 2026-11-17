// Anno del copyright sempre aggiornato
export default function init(radice) {
  radice.querySelectorAll('[data-anno]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}
