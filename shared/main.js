import { supabase } from '../lib/supabaseClient.js';
import { resolveTeamIdByName } from './services/teams.js';
import { $, setText, show, hide } from './ui/elements.js';
import { render as renderMember } from './ui/panels/memberReadOnly.js';
   window.renderMember = renderMember;
import { render as renderManager } from './ui/panels/managerEditable.js';

   window.supabase = supabase;

const sessionPill  = $('session-pill');
const gateStatus   = $('gate-status');
const gateHelp     = $('gate-help');
const memberPanel  = $('member-panel');
const managerPanel = $('manager-panel');
const rosterCount  = $('roster-count');
const rosterTbody  = $('roster-tbody');

function getTeamSlugFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean).map(p => p.toLowerCase());
  if (parts[parts.length - 1] === 'index.html') parts.pop();
  const tIdx = parts.indexOf('teams');
  return tIdx !== -1 ? (parts[tIdx + 1] || null) : (parts[parts.length - 1] || null);
}

async function requireSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error('You must sign in to continue.');
  return session;
}

async function getMyMembership(teamId, userId) {
  const { data, error } = await supabase
    .from('team_memberships_flat')
    .select('team_roles_flat')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}


async function fetchRoster(teamId) {
  console.log("Fetching roster for teamId:", teamId); // ✅ Check 1
  const { data, error } = await supabase
    .from('team_memberships_flat') // ✅ Step 2: use view
    .select('id, user_id, phone, position, jersey_number, full_name, created_at, team_roles_flat')
    .eq('team_id', teamId)
    .order('jersey_number', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  console.log("Roster rows returned:", data); // ✅ Check 2
  return data || [];
}

function applyAccess({ isMgr }) {
  setText(gateStatus, `Access: ${isMgr ? 'Team Manager' : 'Team Member'}`);
  show(memberPanel);
  if (isMgr) show(managerPanel); else hide(managerPanel);
}

let teamId = null;
let isMgr  = false;

async function reloadRoster() {
  const tbodyExists = !!rosterTbody;
  console.log("🔍 rosterTbody exists:", tbodyExists);
  if (!tbodyExists) {
    console.warn("⚠️ rosterTbody not found in DOM. Aborting render.");
    return;
  }

  try {
    const rows = await fetchRoster(teamId);
    console.log(`📦 Fetched ${rows.length} roster row(s)`);

    const setCount = (n) => setText(rosterCount, `${n} player${n === 1 ? '' : 's'}`);

    if (isMgr) {
      console.log("🛠 Rendering manager panel");
      renderManager(rosterTbody, {
        rows,
        setCount,
        onUpdate: async (id, patch) => {
          const { error } = await supabase
            .from('team_memberships')
            .update(patch)
            .eq('id', id);
          if (error) {
            console.error("❌ Update failed:", error);
            throw error;
          }
        },
onDelete: async (id) => {
  try {
    console.log('[delete] attempting membership id:', id);

    // 1) Preflight: can we SEE the base row in public.team_memberships?
    const pre = await supabase
      .from('team_memberships')
      .select('id, team_id, team_roles, user_id')
      .eq('id', id)
      .maybeSingle();

    if (pre.error) {
      console.error('[delete] preflight ERROR reading base row:', pre.error);
    } else {
      console.log('[delete] preflight base row:', pre.data);
    }

    // 2) Perform DELETE and ask PostgREST to return deleted rows (proves SELECT visibility)
    const { data: deleted, error: delErr } = await supabase
      .from('team_memberships')
      .delete()
      .eq('id', id)
      .select('id, team_id, user_id'); // returning shows whether SELECT is allowed

    if (delErr) {
      console.error('❌ Delete failed:', delErr);
      throw delErr;
    }

    console.log('[delete] deleted count:', Array.isArray(deleted) ? deleted.length : 0, 'rows:', deleted);

    // 3) Reload roster (this SELECT hits your view)
    await reloadRoster();
  } catch (e) {
    console.error('🚨 onDelete handler threw:', e);
    alert('Delete failed: ' + (e?.message || e));
  }
},

      });
    } else {
      console.log("👤 Rendering member panel");
      renderMember(rosterTbody, { rows, setCount });
    }
  } catch (e) {
    console.error("🚨 Error in reloadRoster:", e);
    setText(gateStatus, 'Roster failed to load');
    show(gateHelp);
  }
}


(async function init() {
  try {
    console.log("🚀 Initializing team page...");

    const session = await requireSession();
    console.log("🔐 Session loaded for:", session.user.email);
    setText(sessionPill, `Signed in as ${session.user.email}`);

    const slug = getTeamSlugFromPath();
    console.log("🔎 Extracted team slug from URL:", slug);
    if (!slug) throw new Error('No team slug found in URL.');

    teamId = await resolveTeamIdByName(supabase, slug);
    console.log("📌 Resolved teamId:", teamId);

    const membership = await getMyMembership(teamId, session.user.id);
    console.log("👤 Membership check result:", membership);

    if (!membership) {
      console.warn("🚫 No membership found for this user and team.");
      setText(gateStatus, 'You are not a member of this team.');
      show(gateHelp);
      return;
    }

    isMgr = typeof membership.team_roles_flat === 'string' &&
            membership.team_roles_flat.includes('manager');
    console.log("🔓 Access level:", isMgr ? "Manager" : "Member");

    applyAccess({ isMgr });

    console.log("📣 Calling reloadRoster()");
    await reloadRoster();
  } catch (e) {
    console.error("❌ init() failed:", e);
    setText(gateStatus, e.message || 'Authorization error');
    show(gateHelp);
  }
})();

