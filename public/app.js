/* ================= INTRO ================= */
window.addEventListener("load", () => {
  setTimeout(() => {
    const intro = document.getElementById("intro");
    if (intro) intro.style.display = "none";
  }, 2800);
});

/* ================= MODAL ================= */
function openModal(title, content) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalContent").innerText = content;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

/* ================= TEXT ================= */
const aboutText = `Welcome to Chillaxy Community!
We are a place for gamers and creators to connect safely.`;

const faqText = `1. What is Chillaxy?
A safe Discord-based community.
2. Why no self bots?
They break Discord rules.`;

const careersText = `Currently no open positions.
Stay tuned!`;

const privacyShield = `We protect your privacy seriously.
Never share your personal data.`;

const privacyPolicy = `No personal data is collected.
Report suspicious activity.`;

const tos = `Tools are for learning only.
We are not responsible for bans.`;

/* ================= VIDEOS ================= */
let allVideos = [];

fetch("/api/videos")
  .then(r => r.json())
  .then(videos => {
    allVideos = videos;
    renderVideos(videos);
  });

function renderVideos(list) {
  const grid = document.getElementById("videos");
  const noRes = document.getElementById("noResults");
  grid.innerHTML = "";

  if (!list.length) {
    noRes.classList.remove("hidden");
    return;
  }

  noRes.classList.add("hidden");

  list.forEach(v => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <h3>${v.name}</h3>
      <p>${v.description || ""}</p>
      <a href="${v.videoLink}" target="_blank">Watch</a>
    `;
    grid.appendChild(d);
  });
}

document.getElementById("search").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderVideos(allVideos.filter(v => v.name.toLowerCase().includes(q)));
});

/* ================= BANNERS ================= */
fetch("/api/banners")
  .then(r => r.json())
  .then(banners => {
    const track = document.getElementById("banners");
    banners.forEach(b => {
      const img = document.createElement("img");
      img.src = b.url;
      track.appendChild(img);
    });
  });

/* ================= USER STATUS ================= */
fetch("/auth/me")
  .then(r => r.json())
  .then(user => {
    if (!user) return;
    document.getElementById("loginBtn").style.display = "none";
    const join = document.getElementById("joinBox");
    join.classList.remove("hidden");
    setTimeout(() => join.classList.add("hidden"), 300000);
  });
