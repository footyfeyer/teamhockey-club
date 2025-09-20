// Existing functions and event listeners that don't depend on the injected navbar
function subscribe() {
  alert("Thanks for your interest! We'll notify you when we launch.");
}

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    answer.classList.toggle('show');
  });
});

console.log("Welcome to Team Hockey Club!");

// ------------------- Navbar Injection Code -------------------
const navbarHTML = `
  <header class="site-header">
    <div class="container">
      <a class="logo" href="index.html" aria-label="Team Hockey Club Home">
        <img src="../images/THC.png" alt="Team Hockey Club Logo" />
      </a>

      <nav id="primary-nav" aria-label="Main">
        <button class="hamburger" type="button" aria-expanded="false" aria-controls="nav-list">
          ☰ Menu
        </button>

        <ul id="nav-list" class="nav-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="page-1.html">Page 1</a></li>
          <li><a href="page-2.html">Page 2</a></li>
        </ul>
      </nav>
    </div>
  </header>
`;

function setActiveNavLink() {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-header .nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current) a.classList.add('active');
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

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    if (!list.classList.contains('active')) return;
    const withinHeader = e.target.closest('.site-header');
    if (!withinHeader) closeMenu();
  });
}

function loadNavbar() {
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = navbarHTML;
    setActiveNavLink();
    wireHamburger();
  }
}
document.addEventListener('DOMContentLoaded', loadNavbar);
// -------------------------------------------------------------

// ------------------- Footer Injection Code -------------------
const footerHTML = `
  <footer class="footer">
    <p class="powered-by">
      Powered by 
      <a href="https://essentialservices.coffee">Essential Services Coffee</a>
    </p>
    <div>Updated for the <strong>2025–2026</strong> season.</div>
    <div>Questions? Contact your team captain or the league commissioner.</div>
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
