// ui/rosterTable.js

import { updateRow, deleteRow } from '../services/rosters.js';
import { toast } from './alerts.js';

export function mountRosterTable({ supabase, rows, onChange, onDelete }) {
  const tbody = document.getElementById('roster-tbody');
  tbody.innerHTML = '';

  rows.forEach(row => {
    const tr = document.createElement('tr');

    tr.appendChild(tdText(row.players?.full_name || '(unknown)'));
    tr.appendChild(tdText(row.players?.phone || ''));

    // jersey
    tr.appendChild(tdInput(row.jersey_number ?? '', async v => {
      try { await updateRow(supabase, row.id, { jersey_number: v }); toast('Saved'); await onChange(); }
      catch(e){ toast('Save failed: ' + e.message, 'err'); }
    }));

    // role
    tr.appendChild(tdSelect(['player','captain','alternate','goalie','referee'], row.role || 'player', async v=>{
      try { await updateRow(supabase, row.id, { role: v }); toast('Saved'); await onChange(); }
      catch(e){ toast('Save failed: ' + e.message, 'err'); }
    }));

    // status
    tr.appendChild(tdSelect(['active','inactive'], row.status || 'active', async v=>{
      try { await updateRow(supabase, row.id, { status: v }); toast('Saved'); await onChange(); }
      catch(e){ toast('Save failed: ' + e.message, 'err'); }
    }));

    // actions
    const td = document.createElement('td');
    const btn = document.createElement('button');
    btn.className='danger'; btn.type='button'; btn.textContent='Remove';
    btn.addEventListener('click', async ()=>{
      if (!confirm('Remove this player from roster?')) return;
      try { await deleteRow(supabase, row.id); toast('Removed'); await onDelete(); }
      catch(e){ toast('Delete failed: ' + e.message, 'err'); }
    });
    td.appendChild(btn);
    tr.appendChild(td);

    tbody.appendChild(tr);
  });
}

function tdText(text){ const td=document.createElement('td'); td.textContent=text; return td; }
function tdInput(value, onSave){
  const td=document.createElement('td');
  const i=document.createElement('input'); i.type='text'; i.value=value;
  i.addEventListener('change', ()=>onSave(i.value));
  td.appendChild(i); return td;
}
function tdSelect(opts, value, onSave){
  const td=document.createElement('td');
  const s=document.createElement('select');
  opts.forEach(o=>{ const opt=document.createElement('option'); opt.value=o; opt.textContent=o[0].toUpperCase()+o.slice(1); if(o===value) opt.selected=true; s.appendChild(opt); });
  s.addEventListener('change', ()=>onSave(s.value));
  td.appendChild(s); return td;
}
