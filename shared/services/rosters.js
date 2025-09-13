// services/rosters.js

export async function fetchRoster(supabase, team_id) {
  const { data, error } = await supabase
    .from('rosters')
    .select(`
      id, team_id, player_id, jersey_number, role, status,
      players:player_id ( id, full_name, phone )
    `)
    .eq('team_id', team_id)
    .order('jersey_number', { ascending: true });
  if (error) throw error;
  return { rows: data || [], count: (data || []).length };
}

export async function updateRow(supabase, id, patch) {
  const { error } = await supabase.from('rosters').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteRow(supabase, id) {
  const { error } = await supabase.from('rosters').delete().eq('id', id);
  if (error) throw error;
}

export async function addToRoster(supabase, row) {
  const { error } = await supabase.from('rosters').insert(row);
  if (error) throw error;
}
