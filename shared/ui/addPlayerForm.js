// ui/addPlayerForm.js

import { createPlayer } from '../services/players.js';
import { addToRoster } from '../services/rosters.js';
import { toast } from './alerts.js';

export function mountAddPlayerForm({ supabase, TEAM_ID, onAdd }) {
  const root = document.getElementById('add-player-form');
  root.innerHTML = `
    <h2>New Player</h2>
    <div class="grid">
      <div><label>Full name</label><input id="np-name" type="text"/></div>
      <div><label>Phone (optional)</label><input id="np-phone" type="tel"/></div>
      <div><label>Jersey #</label><input id="np-jersey" type="text"/></div>
      <div>
        <label>Role</label>
        <select id="np-role">
          <option value="player">Player</option>
          <option value="captain">Captain</option>
          <option value="alternate">Alternate</option>
          <option value="goalie">Goalie</option>
          <option value="referee">Referee</option>
        </select>
      </div>
    </div>
    <div class="controls" style="margin-top:.75rem;">
      <button id="np-submit" class="primary" type="button">+ Create & add</button>
    </div>
    <div class="hint" id="np-status"></div>
  `;

  root.querySelector('#np-submit').addEventListener('click', async ()=>{
    const full_name = root.querySelector('#np-name').value.trim();
    if (!full_name) { toast('Full name is required', 'warn'); return; }
    const phone = root.querySelector('#np-phone').value.trim() || null;
    const jersey = root.querySelector('#np-jersey').value.trim() || null;
    const role = root.querySelector('#np-role').value;

    try {
      const { data: created, error: perr } = await createPlayer(supabase, { full_name, phone });
      if (perr) throw perr;
      await addToRoster(supabase, { team_id: TEAM_ID, player_id: created.id, jersey_number: jersey, role, status: 'active' });
      toast('Player created & added');
      root.querySelector('#np-name').value = '';
      root.querySelector('#np-phone').value = '';
      root.querySelector('#np-jersey').value = '';
      await onAdd();
    } catch (e) {
      toast('Create/add failed: ' + e.message, 'err');
    }
  });
}
