// services/players.js

export async function searchPlayers(supabase, q) {
  return await supabase.from('players')
    .select('id, full_name, phone')
    .ilike('full_name', `%${q}%`)
    .limit(10);
}

export async function createPlayer(supabase, { full_name, phone }) {
  return await supabase.from('players')
    .insert({ full_name, phone: phone || null })
    .select('id')
    .single();
}
