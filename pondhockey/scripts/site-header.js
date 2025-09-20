// scripts/site_header.js — Standard header and footer injection for TVF Pond Hockey
import { supabase } from "../../lib/supabaseClient.js";

// Optional demo function from earlier pages
function subscribe() {
  alert("Thanks for your interest! We'll notify you when we launch.");
}

// Optional FAQ toggle wiring (safe to keep; no-op if elements don't exist)
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    if (answer) answer.classList.toggle('show');
  });
});

console.log("TVF Pond Hockey UI loaded");

// ------------------- Navbar Injection Code -------------------
const NAV_ITEMS = [
  { label: 'Home', href: 'index.html' },
  { label: 'Rules', href: 'rules.html' },
  { label: 'About', href: 'about.html' },
  { label: 'Contact', href: 'contact.html' },
  { label: 'Sign in', href: 'login.html' },
  // Staff-only “Free Agents (Admin)” will be appended dynamically if user is staff
];

function buildNavList(items) {
  const lis = items.map(({ label, href }) => `<li><a href="${href}">${label}</a></li>`).join('');
  return `<ul id="nav-list" class="nav-links">${lis}</ul>`;
}

const navbarHTML = `
  <header class="site-header">
    <div class="container">
      <a class="logo text-logo" href="index.html" aria-label="TVF Pond Hockey Home"
         style="font-weight:900; font-size:1.3rem; letter-spacing:1px; text-transform:uppercase; color:var(--accent); text-decoration:none; text-shadow:0 1px 4px rgba(0,0,0,.65);">
        TVF Pond Hockey League
      </a>
      <nav id="primary-nav" aria-label="Main">
        <button class="hamburger" type="button" aria-expanded="false" aria-controls="nav-list">☰ Menu</button>
        ${buildNavList(NAV_ITEMS)}
      </nav>
    </div>
  </header>
`;

function setActiveNavLink() {
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.site-header .nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    const normalizedHref = href === '' || href === '/' ? 'index.html' : href;
    if (normalizedHref === current) a.classList.add('active');
  });
}

function wireHamburger() {
  const btn = document.querySelector('.site-header .hamburger');
  const list = document.getElementById('nav-list');
  if (!btn || !list) return;

  function closeMenu() {
    list.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => {
    const isOpen = list.classList.toggle('active');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (!list.classList.contains('active')) return;
    const withinHeader = e.target.closest('.site-header');
    if (!withinHeader) closeMenu();
  });
}

async function maybeAppendStaffLinks() {
  try {
    const { data, error } = await supabase.rpc('is_staff');
    if (error) {
      console.warn('is_staff RPC error (treated as non-staff):', error);
      return;
    }
    const isStaff = !!data;
    if (!isStaff) return;

    const list = document.getElementById('nav-list');
    if (!list) return;

    const links = [
      { href: "admin-free-agents.html", label: "Free Agents (Admin)" },
      { href: "admin-referees.html", label: "Referees (Admin)" }
    ];

    links.forEach(({ href, label }) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${href}">${label}</a>`;
      list.appendChild(li);
    });
  } catch (e) {
    console.warn('is_staff check failed (treated as non-staff):', e);
  }
}


async function loadNavbar() {
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = navbarHTML;
    setActiveNavLink();
    wireHamburger();

    // Add hover effect for the wordmark
    const textLogo = document.querySelector('.text-logo');
    if (textLogo) {
      textLogo.addEventListener('mouseenter', () => {
        textLogo.style.color = 'var(--accent-2)' || '#7ee787';
        textLogo.style.textShadow = '0 2px 6px rgba(0,0,0,.75), 0 0 6px var(--accent-2)';
      });
      textLogo.addEventListener('mouseleave', () => {
        textLogo.style.color = 'var(--accent)' || '#5bbcff';
        textLogo.style.textShadow = '0 1px 4px rgba(0,0,0,.65)';
      });
    }

    // Staff-only link injection
    await maybeAppendStaffLinks();
  }
}
document.addEventListener('DOMContentLoaded', loadNavbar);
// -------------------------------------------------------------

// ------------------- Footer Injection Code -------------------
const footerHTML = `
  <footer class="footer">
    <div class="container">
      <p class="powered-by">
        Powered by <a href="https://tetonroast.club">Teton Roast Club</a>
      </p>
      <div>Updated for the <strong>2025–2026</strong> season.</div>
    </div>
  </footer>
`;

function loadFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }
}
document.addEventListener('DOMContentLoaded', loadFooter);
// -------------------------------------------------------------
