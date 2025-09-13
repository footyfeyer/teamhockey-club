// shared/main.js

import { supabase } from '../lib/supabaseClient.js';
import { resolveTeamIdByName } from './services/teams.js';

// tiny DOM helpers + utilities
import { $, setText, show, hide } from './ui/elements.js';

// panel modules
import { render as renderMember } from './ui/panels/memberReadOnly.js';
import { render as renderManager } from './ui/panels/managerEditable.js';

// --- elements
const sessionPill  = $('session-pill');
const gateStatus   = $('gate-status');
const gateHelp     = $('gate-help');
const memberPanel  = $('member-panel');
const managerPanel = $('manager-panel');
const rosterCount  = $('roster-count');
const rosterTbody  = $('roster-tbody');

// --- URL → team slug
function getTeamSlugFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean).map(p => p.toLowerCase());
  if (parts[parts.length - 1] === 'index.html') parts.pop();
  const tIdx = parts.indexOf('teams');
  return tIdx !== -1 ? (parts[tIdx + 1] || null) : (parts[parts.length - 1] || null);
}

// --- data access
async function requireSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error('You must sign in to continue.');
  return session;
}

async function getMyMembership(teamId, userId) {
  const { data, error } = await supabase
    .from('team_memberships')
    .select('team_roles')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

async function fetchRoster(teamId) {
  const { data, error } = await supabase
    .from('team_memberships')
    .select('id, user_id, phone, position, jersey_number, team_roles, full_name, created_at')
    .eq('team_id', teamId)
    .order('jersey_number', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

// --- access UI
function applyAccess({ isMgr }) {
  setText(gateStatus, `Access: ${isMgr ? 'Team Manager' : 'Team Member'}`);
  show(memberPanel);
  if (isMgr) show(managerPanel); else hide(managerPanel);
}

// --- roster mounting via panels
let teamId = null;
let isMgr  = false;

async function reloadRoster() {
  const rows = await fetchRoster(teamId);
  const setCount = (n) => setText(rosterCount, `${n} player${n === 1 ? '' : 's'}`);

  if (isMgr) {
    // Manager: inline-editable panel with callbacks
    renderManager(rosterTbody, {
      rows,
      setCount,
      onUpdate: async (id, patch) => {
        const { error } = await supabase.from('team_memberships').update(patch).eq('id', id);
        if (error) throw error;
      },
      onDelete: async (id) => {
        const { error } = await supabase.from('team_memberships').delete().eq('id', id);
        if (error) throw error;
        await reloadRoster();
      },
      onAdd: async (draft) => {
        const insertRow = {
          ...draft,
          team_id: teamId,
          user_id: null,          // placeholder until the user links
          team_roles: draft.team_roles ?? ['player'],
        };
        const { error } = await supabase.from('team_memberships').insert(insertRow);
        if (error) {
          console.error('Insert failed', error);
          alert('Could not add player: ' + error.message);
          return;
        }
        await reloadRoster();
      },
    });
  } else {
    // Member: read-only panel
    renderMember(rosterTbody, { rows, setCount });
  }
}

// --- main
(async function init() {
  try {
    // 1) Require session
    const session = await requireSession();
    setText(sessionPill, `Signed in as ${session.user.email}`);

    // 2) Resolve team
    const slug = getTeamSlugFromPath();
    if (!slug) throw new Error('No team slug found in URL.');
    teamId = await resolveTeamIdByName(supabase, slug);

    // 3) Membership check
    const membership = await getMyMembership(teamId, session.user.id);
    if (!membership) {
      setText(gateStatus, 'You are not a member of this team.');
      show(gateHelp);
      return;
    }

    // 4) Access + render
    isMgr = Array.isArray(membership.team_roles) && membership.team_roles.includes('manager');
    applyAccess({ isMgr });
    await reloadRoster();
  } catch (e) {
    setText(gateStatus, e.message || 'Authorization error');
    show(gateHelp);
  }
})();
