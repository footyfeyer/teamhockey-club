// services/teams.js

export async function resolveTeamIdByName(supabase, name) {
  const { data, error } = await supabase
    .from('teams')
    .select('id,name')
    .ilike('name', name)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Team not found: ${name}`);
  return data.id;
}
