// ui/toolbar.js

import { toast } from './alerts.js';
import { exportRosterCsv } from '../utils/csv.js';
import { fetchRoster } from '../services/rosters.js';

export function mountToolbar({ supabase, TEAM_ID, onRefresh }) {
  const el = document.getElementById('toolbar');
  el.innerHTML = `
    <div class="controls">
      <button id="refresh-btn" class="primary" type="button">↻ Refresh</button>
      <button id="preseed-5-btn" class="ghost" type="button">+ Pre-seed 5</button>
      <button id="export-csv-btn" class="ghost" type="button">Export CSV</button>
    </div>
  `;
  el.querySelector('#refresh-btn').addEventListener('click', onRefresh);

  el.querySelector('#preseed-5-btn').addEventListener('click', async ()=>{
    try {
      await preseedPlaceholders(supabase, TEAM_ID, 5);
      toast('Pre-seeded 5 placeholders');
      await onRefresh();
    } catch (e) {
      toast('Pre-seed failed: ' + e.message, 'err');
    }
  });

  el.querySelector('#export-csv-btn').addEventListener('click', async ()=>{
    const { rows } = await fetchRoster(supabase, TEAM_ID);
    exportRosterCsv(rows, 'mashpond-roster.csv');
  });
}

async function preseedPlaceholders(supabase, TEAM_ID, n) {
  const batchPlayers = [];
  for (let i=0;i<n;i++) {
    const { data, error } = await supabase
      .from('players')
      .insert({ full_name: 'TBD Player', phone: null })
      .select('id')
      .single();
    if (error) throw error;
    batchPlayers.push(data.id);
  }
  const batchRows = batchPlayers.map(pid => ({
    team_id: TEAM_ID, player_id: pid, jersey_number: null, role: 'player', status: 'inactive'
  }));
  const { error } = await supabase.from('rosters').insert(batchRows);
  if (error) throw error;
}
