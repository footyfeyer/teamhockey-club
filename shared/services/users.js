// state/users.js

export async function getSelfRoles(supabase, uid) {
  const { data, error } = await supabase
    .from('users')
    .select('id, roles')
    .eq('id', uid)
    .single();
  if (error) return [];
  return Array.isArray(data.roles) ? data.roles : [];
}

export function hasManagerAccess(roles) {
  return roles.includes('hockey') || roles.includes('team_manager');
}
