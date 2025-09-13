// shared/ui/panels/managerEditable.js

import { td, input } from '../elements.js';

export function render(container, { rows, setCount, onUpdate, onDelete, onAdd }) {
  container.innerHTML = '';
  setCount(rows.length);

  const tableBody = document.createDocumentFragment();

  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.dataset.id = r.id;

    // name
    const tdName = document.createElement('td');
    tdName.appendChild(input(r.full_name || '', { 'data-field': 'full_name', 'aria-label': 'Full name' }));
    tr.appendChild(tdName);

    // phone
    const tdPhone = document.createElement('td');
    tdPhone.appendChild(input(r.phone || '', { 'data-field': 'phone', 'aria-label': 'Phone' }));
    tr.appendChild(tdPhone);

    // position
    const tdPos = document.createElement('td');
    tdPos.appendChild(input(r.position || '', { 'data-field': 'position', 'aria-label': 'Position' }));
    tr.appendChild(tdPos);

    // jersey
    const tdJersey = document.createElement('td');
    tdJersey.appendChild(input(r.jersey_number || '', { 'data-field': 'jersey_number', 'aria-label': 'Jersey #' }));
    tr.appendChild(tdJersey);

    // roles (read-only display)
    const roles = Array.isArray(r.team_roles) ? r.team_roles.map(x => x[0].toUpperCase()+x.slice(1)).join(', ') : '';
    tr.appendChild(td(roles));

    // actions
    const tdActions = document.createElement('td');
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'danger';
    del.textContent = 'Remove';
    del.addEventListener('click', async () => {
      if (!confirm('Remove this entry from the roster?')) return;
      await onDelete?.(r.id);
    });
    tdActions.appendChild(del);
    tr.appendChild(tdActions);

    tableBody.appendChild(tr);
  });

  container.appendChild(tableBody);

  // Save-on-blur with delegation
  container.addEventListener('blur', async (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    const tr = el.closest('tr');
    const id = tr?.dataset.id;
    const field = el.getAttribute('data-field');
    if (!id || !field) return;
    await onUpdate?.(id, { [field]: el.value || null });
  }, true);

  // Optional: Add-row controls (if you have a manager form elsewhere, wire it via onAdd)
  const addBtn = document.getElementById('m-add');
  if (addBtn && onAdd) {
    addBtn.onclick = async () => {
      const draft = {
        full_name: document.getElementById('m-name').value.trim() || null,
        phone: document.getElementById('m-phone').value.trim() || null,
        position: document.getElementById('m-position').value.trim() || null,
        jersey_number: document.getElementById('m-jersey').value.trim() || null,
        team_roles: ['player'],
      };
      await onAdd(draft);
    };
  }
}
