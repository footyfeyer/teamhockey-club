// /teams/_shared/teamAuth.js
export function getTeamSlugFromPath(pathname = window.location.pathname) {
  const parts = pathname.split("/").filter(Boolean).map(p => p.toLowerCase());
  if (["index.html", "login.html"].includes(parts[parts.length - 1])) parts.pop();
  const tIdx = parts.indexOf("teams");
  return tIdx !== -1 ? parts[tIdx + 1] : parts[parts.length - 1] || "mashpond";
}

function normPhone(p) {
  return (p || "").replace(/\D/g, "");
}

async function finalizeWith({ supabase, phone, teamSlug, fullName, setStatus }) {
  const normalizedPhone = normPhone(phone);

  const { error: profileErr } = await supabase.rpc("upsert_profile_minimal", {
    p_full_name: fullName || null,
    p_phone_number: phone || null,
  });
  if (profileErr) console.warn("upsert_profile_minimal:", profileErr.message);

  const { data: claimResult, error: claimErr } = await supabase.rpc("claim_memberships_by_phone", {
    p_phone: normalizedPhone,
    p_team_slug: (teamSlug || "").toLowerCase(),
  });

  if (claimErr) throw claimErr;

  if (Array.isArray(claimResult) && claimResult.length > 0) {
    const { status, matched_id, updated } = claimResult[0];
    if (updated) setStatus?.(`Membership linked: ${matched_id}`, "ok");
    else setStatus?.(`Claim attempt: ${status}`, "muted");
  } else {
    setStatus?.("No response from claim RPC.", "error");
  }
}

function defaultRedirect(teamSlug) {
  const params = new URLSearchParams(location.search);
  const next = params.get("next") || `/teams/${teamSlug}/`;
  location.href = next;
}

export async function initTeamAuthPage({
  supabase,
  teamSlug = getTeamSlugFromPath(),
  selectors = {
    status: "#status",
    modeLogin: "#mode-login",
    modeSignup: "#mode-signup",
    loginForm: "#login-form",
    signupForm: "#signup-form",
    loginEmail: "#login-email",
    loginPassword: "#login-password",
    suFullname: "#su-fullname",
    suPhone: "#su-phone",
    suEmail: "#su-email",
    suPassword: "#su-password",
  },
  autoSignOut = true,
  onRedirect = defaultRedirect,
} = {}) {
  if (!supabase) throw new Error("initTeamAuthPage: supabase client is required");

  // Optional: force clean start
  if (autoSignOut) {
    try { await supabase.auth.signOut(); } catch {}

  }

  // Grab DOM
  const statusEl     = document.querySelector(selectors.status);
  const modeLoginBtn = document.querySelector(selectors.modeLogin);
  const modeSignupBtn= document.querySelector(selectors.modeSignup);
  const loginForm    = document.querySelector(selectors.loginForm);
  const signupForm   = document.querySelector(selectors.signupForm);

  const setStatus = (msg, type = "muted") => {
    if (!statusEl) return;
    statusEl.className = type;
    statusEl.textContent = msg;
  };

  const showLogin = () => {
    if (loginForm)  loginForm.style.display  = "";
    if (signupForm) signupForm.style.display = "none";
    setStatus("Log in to continue.");
  };

  const showSignup = () => {
    if (loginForm)  loginForm.style.display  = "none";
    if (signupForm) signupForm.style.display = "";
    setStatus("Create an account. We’ll sync your team if your phone matches.");
  };

  if (modeLoginBtn)  modeLoginBtn.onclick  = showLogin;
  if (modeSignupBtn) modeSignupBtn.onclick = showSignup;

  // LOGIN
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = document.querySelector(selectors.loginEmail)?.value.trim();
    const password = document.querySelector(selectors.loginPassword)?.value;

    setStatus("Logging in…");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setStatus("Error: " + error.message, "error");

    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData?.session?.user) {
        console.warn("Session not available:", sessionErr?.message || "No session");
        setStatus("Login succeeded, but session is missing. Please refresh and try again.", "error");
        return;
      }

      const user = sessionData.session.user;
      const meta = user?.user_metadata || {};
      const phone = meta.phone_number || meta.phone || null;
      const fullName = meta.full_name || null;

      if (phone) {
        setStatus("Linking your team membership…");
        await finalizeWith({ supabase, phone, teamSlug, fullName, setStatus });
        setStatus("All set! You’re linked to your team.", "ok");
      }
    } catch (e2) {
      console.warn("Post-login claim skipped:", e2?.message || e2);
    }

    onRedirect(teamSlug);
  });

  // SIGNUP
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const full_name = document.querySelector(selectors.suFullname)?.value.trim();
    const phone     = document.querySelector(selectors.suPhone)?.value.trim();
    const email     = document.querySelector(selectors.suEmail)?.value.trim();
    const password  = document.querySelector(selectors.suPassword)?.value;

    setStatus("Checking roster…");
    try {
      const { data: matches, error: preErr } = await supabase.rpc("preseed_lookup", {
        p_phone: phone,
        p_team_slug: teamSlug
      });
      if (preErr) throw preErr;
      if (!matches || matches.length === 0) {
        alert("Your team manager hasn’t added you to the roster yet. Please contact them first.");
        setStatus("Signup blocked — phone not found on roster.", "error");
        return;
      }

      setStatus("Creating account…");
      const { error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/teams/${teamSlug}/postconfirm.html`,
          data: { full_name, phone_number: phone }
        }
      });
      if (signErr) throw signErr;

      setStatus("Check your email to confirm your account. After you confirm, we’ll link your membership.", "ok");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message, "error");
    }
  });

  // default view
  showLogin();

  // expose helpers if you want to unit test
  return { setStatus, showLogin, showSignup, finalizeWith: (args) => finalizeWith({ supabase, teamSlug, setStatus, ...args }) };
}
