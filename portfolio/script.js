/* ============================================================
   Rayan Ali Shah — Portfolio
   Vanilla JS, no build step. Deployable to Vercel as a static site.
   ============================================================ */

const GITHUB_USERNAME = "RAYANAli63";
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------- Loader ---------------- */
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => loader.classList.add("hidden"), 600);
});

/* ---------------- Custom cursor ---------------- */
const dot = document.getElementById("cursor-dot");
const ring = document.getElementById("cursor-ring");
let mx = 0, my = 0, rx = 0, ry = 0;
window.addEventListener("mousemove", (e) => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + "px"; dot.style.top = my + "px";
});
(function loopCursor(){
  rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
  ring.style.left = rx + "px"; ring.style.top = ry + "px";
  requestAnimationFrame(loopCursor);
})();
document.querySelectorAll("a, button, .chip, input, textarea, .proj-card, .repo-card").forEach(el => {
  el.addEventListener("mouseenter", () => ring.classList.add("active"));
  el.addEventListener("mouseleave", () => ring.classList.remove("active"));
});

/* ---------------- Hero photo parallax tilt ---------------- */
const photoFrame = document.querySelector(".photo-frame");
if (photoFrame) {
  photoFrame.addEventListener("mousemove", (e) => {
    const r = photoFrame.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    photoFrame.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
  });
  photoFrame.addEventListener("mouseleave", () => { photoFrame.style.transform = ""; });
}

/* ---------------- Magnetic buttons ---------------- */
document.querySelectorAll(".magnetic").forEach(btn => {
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
  });
  btn.addEventListener("mouseleave", () => { btn.style.transform = "translate(0,0)"; });
});

/* ---------------- Scroll progress + navbar ---------------- */
const progress = document.getElementById("scroll-progress");
const navbar = document.getElementById("navbar");
const backToTop = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = scrolled + "%";
  navbar.classList.toggle("scrolled", h.scrollTop > 40);
  backToTop.classList.toggle("visible", h.scrollTop > 500);
}, { passive: true });
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ---------------- Mobile nav ---------------- */
const navToggle = document.getElementById("nav-toggle");
const mobileMenu = document.querySelector(".nav-links-mobile");
navToggle.addEventListener("click", () => mobileMenu.classList.toggle("open"));
mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileMenu.classList.remove("open")));

/* ---------------- Active section highlight ---------------- */
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach(s => sectionObserver.observe(s));

/* ---------------- Reveal on scroll ---------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal-up").forEach(el => revealObserver.observe(el));

/* ---------------- Typed role ---------------- */
const roles = [
  "Full Stack Web Developer",
  "React & Node.js Engineer",
  "REST API Architect",
  "MERN Stack Specialist"
];
const typedEl = document.getElementById("typed-role");
let roleIdx = 0, charIdx = 0, deleting = false;
function typeLoop(){
  const current = roles[roleIdx];
  if (!deleting) {
    charIdx++;
    typedEl.textContent = current.slice(0, charIdx);
    if (charIdx === current.length) { deleting = true; setTimeout(typeLoop, 1600); return; }
  } else {
    charIdx--;
    typedEl.textContent = current.slice(0, charIdx);
    if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
  }
  setTimeout(typeLoop, deleting ? 35 : 65);
}
typeLoop();

/* ---------------- Particle field ---------------- */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particles = [];
function resizeCanvas(){
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
function initParticles(){
  resizeCanvas();
  const count = window.innerWidth < 700 ? 30 : 60;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    a: Math.random() * 0.5 + 0.2
  }));
}
function drawParticles(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(150,150,255,${p.a})`;
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
initParticles();
drawParticles();
window.addEventListener("resize", initParticles);

/* ============================================================
   DATA — edit these arrays to update site content
   ============================================================ */

const SKILLS = [
  { cat: "Frontend", items: [["React / Next.js", 90], ["JavaScript (ES6+)", 92], ["Tailwind CSS", 90], ["HTML5 / CSS3", 95]] },
  { cat: "Backend", items: [["Node.js / Express", 90], ["Laravel / PHP", 75], ["REST API Design", 88], ["Authentication (JWT)", 85]] },
  { cat: "Database", items: [["MongoDB", 88], ["MySQL", 80], ["Mongoose ODM", 85], ["Database Design", 82]] },
  { cat: "Tools & Platform", items: [["Git / GitHub", 92], ["Vercel / Railway", 85], ["Postman", 88], ["VS Code", 95]] }
];

// Each project ships a hand-built SVG interface mockup (not a literal
// screenshot — these projects use live databases/auth we can't render here)
// styled to represent its actual layout, so the card shows something true
// to the product instead of a flat placeholder block.
function browserChrome(accent){
  return `<rect x="0" y="0" width="400" height="26" fill="#14121f"/>
    <circle cx="14" cy="13" r="4" fill="#ff5f57"/><circle cx="28" cy="13" r="4" fill="#febc2e"/><circle cx="42" cy="13" r="4" fill="#28c840"/>
    <rect x="64" y="6" width="180" height="14" rx="7" fill="#1e1b2e"/>`;
}

const MOCK_DOCTORHUB = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="220" fill="#0d1420"/>${browserChrome()}
  <rect x="0" y="26" width="92" height="194" fill="#0f1b2e"/>
  ${[0,1,2,3,4].map((i)=>`<rect x="16" y="${46+i*32}" width="60" height="10" rx="3" fill="${i===1?'#4f8cff':'#233047'}"/>`).join("")}
  <rect x="108" y="42" width="276" height="34" rx="8" fill="#132132"/>
  <rect x="122" y="53" width="120" height="8" rx="4" fill="#4f8cff"/>
  <rect x="108" y="86" width="130" height="60" rx="10" fill="#132132"/>
  <circle cx="128" cy="106" r="10" fill="#4f8cff" opacity=".8"/>
  <rect x="146" y="100" width="70" height="6" rx="3" fill="#2c4568"/>
  <rect x="146" y="112" width="50" height="6" rx="3" fill="#233047"/>
  <rect x="122" y="130" width="90" height="8" rx="4" fill="#5fd0ff"/>
  <rect x="246" y="86" width="138" height="60" rx="10" fill="#132132"/>
  <rect x="260" y="100" width="60" height="34" rx="6" fill="#1c3350"/>
  <rect x="326" y="100" width="46" height="34" rx="6" fill="#4f8cff" opacity=".7"/>
  <rect x="108" y="156" width="276" height="46" rx="10" fill="#132132"/>
  <rect x="122" y="168" width="160" height="8" rx="4" fill="#2c4568"/>
  <rect x="122" y="182" width="100" height="8" rx="4" fill="#233047"/>
  <rect x="330" y="168" width="40" height="18" rx="9" fill="#4ade80" opacity=".85"/>
</svg>`;

const MOCK_CHOPPRIME = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="220" fill="#170f1c"/>${browserChrome()}
  <rect x="0" y="26" width="400" height="70" fill="#241531"/>
  <rect x="24" y="46" width="150" height="12" rx="4" fill="#e7c9a3"/>
  <rect x="24" y="66" width="100" height="8" rx="4" fill="#9b6bff"/>
  <rect x="300" y="52" width="76" height="26" rx="13" fill="#9b6bff"/>
  <rect x="24" y="112" width="108" height="86" rx="10" fill="#241531"/>
  <rect x="34" y="122" width="88" height="40" rx="6" fill="#3a2246"/>
  <rect x="34" y="170" width="70" height="7" rx="3" fill="#e7c9a3"/>
  <rect x="34" y="182" width="40" height="7" rx="3" fill="#6b5a7d"/>
  <rect x="146" y="112" width="108" height="86" rx="10" fill="#241531"/>
  <rect x="156" y="122" width="88" height="40" rx="6" fill="#3a2246"/>
  <rect x="156" y="170" width="70" height="7" rx="3" fill="#e7c9a3"/>
  <rect x="156" y="182" width="40" height="7" rx="3" fill="#6b5a7d"/>
  <rect x="268" y="112" width="108" height="86" rx="10" fill="#241531"/>
  <rect x="278" y="122" width="88" height="40" rx="6" fill="#3a2246"/>
  <rect x="278" y="170" width="70" height="7" rx="3" fill="#e7c9a3"/>
  <rect x="278" y="182" width="40" height="7" rx="3" fill="#6b5a7d"/>
</svg>`;

const MOCK_VOTESECURE = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="220" fill="#0c1a16"/>${browserChrome()}
  <rect x="24" y="42" width="200" height="12" rx="4" fill="#5fd0ff"/>
  <rect x="24" y="62" width="120" height="8" rx="4" fill="#2a4f47"/>
  ${[0,1,2].map((i)=>`<g>
    <rect x="24" y="${92+i*38}" width="352" height="30" rx="8" fill="#122822"/>
    <circle cx="42" cy="${107+i*38}" r="9" fill="${i===1?'#5fd0ff':'#1c3a32'}"/>
    <rect x="60" y="${102+i*38}" width="150" height="7" rx="3" fill="#2a4f47"/>
    <rect x="330" y="${100+i*38}" width="30" height="12" rx="6" fill="${i===1?'#4ade80':'#1c3a32'}"/>
  </g>`).join("")}
</svg>`;

const MOCK_COMMITTEE = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="220" fill="#1c1608"/>${browserChrome()}
  <rect x="24" y="40" width="352" height="40" rx="10" fill="#241d0d"/>
  <rect x="38" y="52" width="90" height="8" rx="4" fill="#f0c75e"/>
  <rect x="38" y="66" width="60" height="6" rx="3" fill="#7a6a3c"/>
  <rect x="300" y="50" width="60" height="20" rx="10" fill="#4f8cff"/>
  ${[0,1,2,3].map((i)=>`<g>
    <rect x="24" y="${94+i*28}" width="352" height="22" rx="6" fill="${i%2===0?'#241d0d':'#1c1608'}"/>
    <rect x="36" y="${101+i*28}" width="80" height="7" rx="3" fill="#a3915c"/>
    <rect x="300" y="${101+i*28}" width="60" height="7" rx="3" fill="#f0c75e"/>
  </g>`).join("")}
</svg>`;

const MOCK_TWITTER = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="220" fill="#101420"/>${browserChrome()}
  ${[0,1,2].map((i)=>`<g>
    <rect x="24" y="${38+i*58}" width="352" height="48" rx="10" fill="#161b2b"/>
    <circle cx="46" cy="${62+i*58}" r="12" fill="#9b6bff" opacity=".8"/>
    <rect x="66" y="${52+i*58}" width="90" height="7" rx="3" fill="#c7c6db"/>
    <rect x="66" y="${64+i*58}" width="160" height="6" rx="3" fill="#3a3a55"/>
    <rect x="66" y="${74+i*58}" width="110" height="6" rx="3" fill="#2a2a40"/>
    <circle cx="350" cy="${74+i*58}" r="7" fill="#ff5f8a" opacity=".8"/>
  </g>`).join("")}
</svg>`;

const MOCK_ADFLOW = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="220" fill="#170c1e"/>${browserChrome()}
  ${[0,1,2].map((i)=>`<g transform="translate(${24+i*124},40)">
    <rect width="104" height="150" rx="10" fill="#231331"/>
    <rect x="10" y="12" width="84" height="60" rx="6" fill="#3a2352"/>
    <rect x="10" y="82" width="70" height="8" rx="4" fill="#e7d8ff"/>
    <rect x="10" y="96" width="50" height="6" rx="3" fill="#7a5a9e"/>
    <rect x="10" y="114" width="40" height="16" rx="8" fill="#5fd0ff"/>
    <rect x="58" y="116" width="36" height="12" rx="6" fill="#4ade80" opacity=".85"/>
  </g>`).join("")}
</svg>`;

const FEATURED_PROJECTS = [
  {
    title: "Doctor Hub",
    cat: "Full Stack",
    desc: "Healthcare consultation platform with five role-based dashboards — patients, doctors, assistants, admin and super admin — with appointment booking and payment workflows.",
    tags: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    github: "https://github.com/RAYANAli63",
    mock: MOCK_DOCTORHUB
  },
  {
    title: "Chop Prime Steakhouse",
    cat: "Full Stack",
    desc: "Restaurant website on the MERN stack with an admin dashboard, table booking system, and Nodemailer + Twilio WhatsApp API notifications.",
    tags: ["React", "Vite", "Node.js", "MongoDB Atlas", "Twilio"],
    github: "https://github.com/RAYANAli63",
    mock: MOCK_CHOPPRIME
  },
  {
    title: "VoteSecure",
    cat: "Full Stack",
    desc: "Secure online election management system built with React and Supabase, deployed on Vercel, with row-level security and RPC-driven vote logic.",
    tags: ["React", "Supabase", "PostgreSQL", "Vercel"],
    github: "https://github.com/RAYANAli63/FA23-BSE-077-AWT",
    mock: MOCK_VOTESECURE
  },
  {
    title: "Money Committee Manager",
    cat: "Full Stack",
    desc: "Digital take on the Pakistani 'کمیٹی' rotating-savings model — built in two iterations, a client-only version and a MongoDB + Railway backend version.",
    tags: ["MEAN Stack", "MongoDB", "Railway"],
    github: "https://github.com/RAYANAli63",
    mock: MOCK_COMMITTEE
  },
  {
    title: "Twitter / X Clone",
    cat: "Backend",
    desc: "Full MERN social platform clone with Socket.io real-time updates, JWT authentication, likes, replies and a following system.",
    tags: ["MERN", "Socket.io", "JWT"],
    github: "https://github.com/RAYANAli63",
    mock: MOCK_TWITTER
  },
  {
    title: "AdFlow Pro",
    cat: "Frontend",
    desc: "Sponsored listing marketplace built as a single-file app localized for Pakistan — PKR pricing, JazzCash and Easypaisa payment flows.",
    tags: ["JavaScript", "HTML5", "CSS3"],
    github: "https://github.com/RAYANAli63",
    mock: MOCK_ADFLOW
  }
];

const SERVICES = [
  { icon: "◆", title: "Frontend Development", desc: "Responsive, accessible interfaces in React and Tailwind CSS that feel fast on every device." },
  { icon: "▣", title: "Backend Development", desc: "Node.js/Express or Laravel APIs with clean, maintainable architecture and proper auth." },
  { icon: "⬡", title: "Full Stack Web Development", desc: "End-to-end builds — schema to deployment — for platforms that need to actually work in production." },
  { icon: "⇄", title: "REST API Development", desc: "Well-documented, versioned APIs designed for real client consumption, not just a demo." },
  { icon: "▤", title: "Database Design", desc: "MongoDB and MySQL schema design focused on integrity, performance and future growth." },
  { icon: "▲", title: "Deployment", desc: "Shipping to Vercel, Railway and similar platforms with CI-friendly, zero-downtime setups." }
];

const TIMELINE = [
  { date: "2023 — Present", title: "BS Software Engineering, COMSATS University Islamabad", desc: "Coursework spanning software engineering, algorithms, and software quality assurance, alongside hands-on full-stack project work." },
  { date: "2025", title: "Full Stack Project Streak", desc: "Built Doctor Hub, VoteSecure, Money Committee Manager, and the Chop Prime Steakhouse platform across MERN and MEAN stacks." },
  { date: "2026", title: "Internship / Industry Training", desc: "Undertaking a professional internship through early August, applying full-stack skills to real-world workflows." },
  { date: "2026", title: "Final Year Project", desc: "Designing an AI-Powered Smart Classroom Platform — SRS and specification complete, ERD/UML and development in progress." }
];

// Add certificates here as { title, issuer, date, fileUrl } — the section
// stays hidden until this array has at least one real entry.
const CERTIFICATES = [];

/* ---------------- Render: Skills ---------------- */
const skillsGrid = document.getElementById("skills-grid");
skillsGrid.innerHTML = SKILLS.map(group => `
  <div class="skill-card">
    <p class="skill-cat">${group.cat}</p>
    ${group.items.map(([name, pct]) => `
      <div class="skill-item">
        <div class="skill-item-top"><span>${name}</span><span>${pct}%</span></div>
        <div class="skill-bar"><div class="skill-bar-fill" data-pct="${pct}"></div></div>
      </div>
    `).join("")}
  </div>
`).join("");
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll(".skill-bar-fill").forEach(bar => {
        bar.style.width = bar.dataset.pct + "%";
      });
      skillObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll(".skill-card").forEach(c => skillObserver.observe(c));

/* ---------------- Render: Featured projects (3D tilt) ---------------- */
const featuredGrid = document.getElementById("featured-grid");
featuredGrid.innerHTML = FEATURED_PROJECTS.map(p => `
  <div class="proj-card" style="--tilt-x:0deg;--tilt-y:0deg;">
    <div class="proj-thumb">${p.mock}</div>
    <div class="proj-body">
      <p class="proj-cat">${p.cat}</p>
      <h3 class="proj-title">${p.title}</h3>
      <p class="proj-desc">${p.desc}</p>
      <div class="proj-tags">${p.tags.map(t => `<span class="proj-tag">${t}</span>`).join("")}</div>
      <div class="proj-links">
        <a href="${p.github}" target="_blank" rel="noopener">GitHub ↗</a>
      </div>
    </div>
  </div>
`).join("");
document.querySelectorAll(".proj-card").forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

/* ---------------- Render: Services ---------------- */
document.getElementById("services-grid").innerHTML = SERVICES.map(s => `
  <div class="service-card reveal-up">
    <div class="service-icon">${s.icon}</div>
    <h3 class="service-title">${s.title}</h3>
    <p class="service-desc">${s.desc}</p>
  </div>
`).join("");
document.querySelectorAll("#services-grid .reveal-up").forEach(el => revealObserver.observe(el));

/* ---------------- Render: Timeline ---------------- */
document.getElementById("timeline").innerHTML = TIMELINE.map(t => `
  <div class="tl-item reveal-up">
    <span class="tl-dot"></span>
    <p class="tl-date">${t.date}</p>
    <h3 class="tl-title">${t.title}</h3>
    <p class="tl-desc">${t.desc}</p>
  </div>
`).join("");
document.querySelectorAll(".tl-item.reveal-up").forEach(el => revealObserver.observe(el));

/* ---------------- Render: Certificates ---------------- */
if (CERTIFICATES.length > 0) {
  document.getElementById("certificates").style.display = "";
  document.getElementById("cert-grid").innerHTML = CERTIFICATES.map(c => `
    <div class="cert-card">
      <h3 class="proj-title" style="font-size:15px;">${c.title}</h3>
      <p class="proj-desc">${c.issuer} — ${c.date}</p>
      <a href="${c.fileUrl}" download class="proj-links">Download ↓</a>
    </div>
  `).join("");
}

/* ============================================================
   GitHub API — live repositories + profile dashboard
   ============================================================ */

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c",
  Python: "#3572A5", PHP: "#4F5D95", Java: "#b07219", Shell: "#89e051",
  EJS: "#a91e50", Vue: "#41b883", C: "#555555", "C++": "#f34b7d"
};

function categorize(repo){
  const name = (repo.name + " " + (repo.description || "")).toLowerCase();
  const lang = (repo.language || "").toLowerCase();
  if (name.includes("laravel") || lang === "php") return "Laravel";
  if (name.includes("api")) return "APIs";
  if (lang === "javascript" && (name.includes("react") || repo.topics?.includes("react"))) return "React";
  if (name.includes("react")) return "React";
  if (lang === "typescript") return "React";
  if (name.includes("node") || name.includes("express") || name.includes("backend")) return "Node.js";
  if (name.includes("full") || name.includes("mern") || name.includes("mean")) return "Full Stack";
  if (lang === "html" || lang === "css") return "Frontend";
  if (lang === "javascript") return "JavaScript";
  return "Other";
}

let allRepos = [];
let activeFilter = "All";

async function loadGitHub(){
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`)
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API request failed");
    const user = await userRes.json();
    const repos = await reposRes.json();

    // Dashboard
    document.getElementById("gh-avatar").src = user.avatar_url;
    document.getElementById("gh-name").textContent = user.name || user.login;
    document.getElementById("gh-repos").textContent = user.public_repos ?? "—";
    document.getElementById("gh-followers").textContent = user.followers ?? "—";
    document.getElementById("gh-following").textContent = user.following ?? "—";
    document.getElementById("gh-count").textContent = `— ${repos.length} repositories`;

    // Top languages
    const langCount = {};
    repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
    const total = Object.values(langCount).reduce((a, b) => a + b, 0) || 1;
    const sortedLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    document.getElementById("gh-lang-bars").innerHTML = sortedLangs.map(([lang, count]) => {
      const pct = (count / total * 100).toFixed(0);
      const color = LANG_COLORS[lang] || "#8888aa";
      return `<div title="${lang} ${pct}%" style="width:${pct}%;background:${color};"></div>`;
    }).join("");

    allRepos = repos.filter(r => !r.fork);
    renderFilters(allRepos);
    renderRepos(allRepos);
  } catch (err) {
    document.getElementById("repo-grid").innerHTML =
      `<p class="repo-loading">Couldn't reach the GitHub API right now — visit the profile directly at <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener" style="color:var(--cyan)">github.com/${GITHUB_USERNAME}</a>.</p>`;
  }
}

function renderFilters(repos){
  const cats = ["All", ...new Set(repos.map(categorize))];
  document.getElementById("filter-chips").innerHTML = cats.map(c =>
    `<span class="chip ${c === "All" ? "active" : ""}" data-cat="${c}">${c}</span>`
  ).join("");
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("mouseenter", () => ring.classList.add("active"));
    chip.addEventListener("mouseleave", () => ring.classList.remove("active"));
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.cat;
      applyFilters();
    });
  });
}

function renderRepos(repos){
  const grid = document.getElementById("repo-grid");
  if (repos.length === 0) {
    grid.innerHTML = `<p class="repo-loading">No repositories match that search.</p>`;
    return;
  }
  grid.innerHTML = repos.map(r => `
    <div class="repo-card">
      <h4 class="repo-name"><span>${r.name}</span>${r.stargazers_count > 0 ? `★ ${r.stargazers_count}` : ""}</h4>
      <p class="repo-desc">${r.description ? r.description : "No description provided."}</p>
      <div class="repo-meta">
        ${r.language ? `<span><span class="repo-lang-dot" style="background:${LANG_COLORS[r.language] || '#8888aa'}"></span>${r.language}</span>` : ""}
        <span>Updated ${new Date(r.updated_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
      </div>
      <div class="proj-links" style="margin-top:14px;">
        <a href="${r.html_url}" target="_blank" rel="noopener">Code ↗</a>
        ${r.homepage ? `<a href="${r.homepage}" target="_blank" rel="noopener">Live Demo ↗</a>` : ""}
      </div>
    </div>
  `).join("");
}

function applyFilters(){
  const query = document.getElementById("project-search").value.toLowerCase();
  let filtered = allRepos;
  if (activeFilter !== "All") filtered = filtered.filter(r => categorize(r) === activeFilter);
  if (query) filtered = filtered.filter(r =>
    r.name.toLowerCase().includes(query) || (r.description || "").toLowerCase().includes(query)
  );
  renderRepos(filtered);
}
document.getElementById("project-search").addEventListener("input", applyFilters);

loadGitHub();

/* ============================================================
   Contact form — EmailJS
   To go live: create a free account at emailjs.com, then:
   1. Add your Service ID, Template ID and Public Key below.
   2. Uncomment the emailjs.send(...) call.
   Until configured, the form validates and shows a friendly
   message explaining it isn't wired to an email service yet.
   ============================================================ */

const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

const form = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");
const formStatus = document.getElementById("form-status");

function validateField(input){
  const errorEl = document.querySelector(`.field-error[data-for="${input.name}"]`);
  let msg = "";
  if (!input.value.trim()) msg = "This field is required.";
  else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) msg = "Enter a valid email address.";
  errorEl.textContent = msg;
  input.closest(".field").classList.toggle("error", !!msg);
  return !msg;
}

form.querySelectorAll("input, textarea").forEach(input => {
  input.addEventListener("blur", () => validateField(input));
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const inputs = [...form.querySelectorAll("input, textarea")];
  const valid = inputs.map(validateField).every(Boolean);
  if (!valid) return;

  submitBtn.classList.add("loading");
  submitBtn.disabled = true;
  formStatus.textContent = "";
  formStatus.className = "form-status";

  try {
    if (EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
      // EmailJS not configured yet — simulate so the UX can still be tested end to end.
      await new Promise(res => setTimeout(res, 900));
      formStatus.textContent = "Form isn't connected to an email service yet — add your EmailJS keys in script.js to go live.";
      formStatus.classList.add("error");
    } else {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: form.name.value,
        from_email: form.email.value,
        subject: form.subject.value,
        message: form.message.value,
        to_email: "rayanshah701@gmail.com"
      }, EMAILJS_PUBLIC_KEY);
      formStatus.textContent = "Message sent — thanks! I'll reply within a day.";
      formStatus.classList.add("success");
      form.reset();
    }
  } catch (err) {
    formStatus.textContent = "Something went wrong sending that. Please email rayanshah701@gmail.com directly.";
    formStatus.classList.add("error");
  } finally {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  }
});
