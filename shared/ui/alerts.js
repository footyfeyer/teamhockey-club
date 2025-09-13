// ui/alerts.js

let alerts, card;
export function mount() {
  alerts = document.getElementById('alerts');
  card = document.getElementById('alerts-card');
}
export function toast(msg, type='ok') {
  if (!alerts) return;
  card.classList.remove('hidden');
  const div = document.createElement('div');
  div.className = type === 'err' ? 'err' : (type === 'warn' ? 'warn' : 'ok');
  div.style.margin = '.25rem 0';
  div.textContent = msg;
  alerts.prepend(div);
  setTimeout(()=>div.remove(), 6000);
}
