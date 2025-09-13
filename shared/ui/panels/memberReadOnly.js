// shared/ui/panels/memberReadOnly.js

import { td } from '../elements.js';

export function render(container, { rows, setCount }) {
  container.innerHTML = '';
  setCount(rows.length);

  const frag = document.createDocumentFragment();
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.appendChild(td(r.full_name?.trim() || (r.user_id ? `User ${String(r.user_id).slice(0,8)}…` : '(placeholder)')));
    tr.appendChild(td(r.phone || ''));
    tr.appendChild(td(r.position || ''));
    tr.appendChild(td(r.jersey_number || ''));
    const roles = Array.isArray(r.team_roles) ? r.team_roles.map(x => x[0].toUpperCase()+x.slice(1)).join(', ') : '';
    tr.appendChild(td(roles));
    frag.appendChild(tr);
  });
  container.appendChild(frag);
}
