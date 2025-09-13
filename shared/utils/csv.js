// utils/csv.js

export function exportRosterCsv(rows, filename='roster.csv') {
  const data = [['full_name','phone','jersey_number','role','status']];
  rows.forEach(r=>{
    data.push([
      (r.players?.full_name||'').replaceAll(',', ' '),
      (r.players?.phone||''),
      r.jersey_number ?? '',
      r.role ?? 'player',
      r.status ?? 'active'
    ]);
  });
  const csv = data.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
