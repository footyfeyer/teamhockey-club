import { td } from '../elements.js';

export function render(container, { rows, setCount }) {
  container.innerHTML = '';
  setCount(rows.length);

  const frag = document.createDocumentFragment();
  rows.forEach(r => {
    const tr = document.createElement('tr');

    tr.appendChild(td(
      r.full_name?.trim() ||
      (r.user_id ? `User ${String(r.user_id).slice(0, 8)}…` : '(placeholder)')
    ));

    tr.appendChild(td(r.phone || ''));
    tr.appendChild(td(r.position || ''));
    tr.appendChild(td(r.jersey_number || ''));

    // ✅ Handle team_roles_flat as a comma-separated string
    const roles = typeof r.team_roles_flat === 'string'
      ? r.team_roles_flat
          .split(',')
          .map(role => role.trim())
          .filter(Boolean)
          .map(role => role[0].toUpperCase() + role.slice(1))
          .join(', ')
      : '';

    tr.appendChild(td(roles));
    frag.appendChild(tr);
  });

  container.appendChild(frag);
}
