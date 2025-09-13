// state/session.js

export async function requireSession(supabase) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error('You must sign in to continue.');
  return session;
}
