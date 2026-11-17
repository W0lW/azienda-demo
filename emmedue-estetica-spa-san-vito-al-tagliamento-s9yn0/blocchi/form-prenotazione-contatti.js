// Modulo DEMO: valida nel browser e NON invia nulla (nessuna chiamata di rete).
export default function init(radice) {
  const form = radice.querySelector('.b-fp__form');
  const stato = radice.querySelector('.b-fp__stato');
  const max = Number(radice.dataset.max) || 12;
  const demo = radice.dataset.demo || '';
  const oggi = new Date(); oggi.setMinutes(oggi.getMinutes() - oggi.getTimezoneOffset());
  const oggiIso = oggi.toISOString().slice(0, 10);
  form.elements.data.min = oggiIso;

  const msg = (campo, testo) => {
    const el = radice.querySelector(`[data-errore="${campo}"]`);
    if (el) el.textContent = testo;
    const input = form.elements[campo];
    if (input) input.setAttribute('aria-invalid', testo ? 'true' : 'false');
    return !testo;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const vuoto = 'Manca questo dato.';
    let ok = true;
    ok = msg('esperienza', f.esperienza.value ? '' : vuoto) && ok;
    ok = msg('data', !f.data.value ? vuoto : (f.data.value < oggiIso ? 'Scegli una data da oggi in avanti.' : '')) && ok;
    const n = Number(f.persone.value);
    ok = msg('persone', !n ? vuoto : (n > max ? 'Per gruppi più grandi scrivici o chiamaci.' : '')) && ok;
    ok = msg('nome', f.nome.value.trim() ? '' : vuoto) && ok;
    const tel = f.telefono.value.trim();
    ok = msg('telefono', !tel ? vuoto : (/^[+\d][\d\s().-]{5,}$/.test(tel) ? '' : 'Controlla il numero di telefono.')) && ok;
    ok = msg('privacy', f.privacy.checked ? '' : 'Per inviare la richiesta devi confermare di aver letto l\'informativa privacy.') && ok;
    if (!ok) {
      stato.hidden = true;
      const primo = form.querySelector('[aria-invalid="true"]');
      if (primo) primo.focus();
      return;
    }
    stato.textContent = demo;
    stato.hidden = false;
  });
}
