// ui/playerSearch.js

import { searchPlayers } from '../services/players.js';
import { addToRoster } from '../services/rosters.js';
import { toast } from './alerts.js';

export function mountPlayerSearch({ supabase, TEAM_ID, onAdd }) {
  const root = document.getElementById('player-search');
  root.innerHTML = `
    <h2>Add Player</h2>
    <label for="player-search-input">Find existing player</label>
    <input id="player-search-input" type="text" placeholder="Start typing a name… (min 2 chars)"/>
    <div class="hint" id="ps-hint"></div>
    <div id="ps-results"></div>
  `;

  const input = root.querySelector('#player-search-input');
  const hint = root.querySelector('#ps-hint');
  const results = root.querySelector('#ps-results');

  let t = 0;
  input.addEventListener('input', ()=>{
    clearTimeout(t);
    const q = input.value.trim();
    if (q.length < 2) { hint.textContent = 'Type at least 2 characters…'; results.innerHTML = ''; return; }
    hint.textContent = 'Searching…';
    t = setTimeout(async ()=>{
      const { data, error } = await searchPlayers(supabase, q);
      if (error) { hint.textContent = 'Search error'; return; }
      hint.textContent = data.length ? `Found ${data.length}` : 'No matches';
      results.innerHTML = '';
      data.forEach(p=>{
        const b = document.createElement('button');
        b.type='button'; b.className='primary';
        b.textContent = `Add ${p.full_name}${p.phone ? ' • '+p.phone:''}`;
        b.style.margin='.25rem 0';
        b.addEventListener('click', async ()=>{
          const jersey = prompt(`Jersey # for ${p.full_name}?`, '') ?? null;
          const role = (prompt(`Role for ${p.full_name}? (player/captain/alternate/goalie/referee)`, 'player') || 'player');
          try {
            await addToRoster(supabase, { team_id: TEAM_ID, player_id: p.id, jersey_number: jersey, role, status: 'active' });
            toast('Added to roster');
            await onAdd();
          } catch (e) { toast('Add failed: ' + e.message, 'err'); }
        });
        results.appendChild(b);
      });
    }, 250);
  });
}
