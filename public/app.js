/* ================= CONFIG ================= */

const API = "https://chillaxy.up.railway.app/api";

const videosGrid = document.querySelector(".videos-grid");
const searchInput = document.querySelector(".topbar input");
const noResults = document.querySelector(".no-results");
const intro = document.getElementById("intro");
const authArea = document.getElementById("authArea");
const dashboardModal = document.getElementById("dashboard");

/* ================= INTRO ================= */

window.addEventListener("load", () => {
  setTimeout(() => {
    intro.style.display = "none";
  }, 2800);
});

/* ================= AUTH CHECK ================= */

let CURRENT_USER = null;
let IS_ADMIN = false;

fetch("/api/me")
  .then(r => {
    if (r.status === 401) return null;
    return r.json();
  })
  .then(user => {
    if (!user) return;

    CURRENT_USER = user;
    IS_ADMIN = user.isAdmin;

    // UI
    authArea.innerHTML = `
      <span class="user-name">👋 ${user.id}</span>
      ${IS_ADMIN ? `<button class="login-btn" onclick="toggleDash()">Dashboard</button>` : ""}
      <a href="/auth/logout" class="login-btn">Logout</a>
    `;

    showJoinStatus();
  });

/* ================= HERO SLIDER ================= */

let heroIndex = 0;
const heroTrack = document.querySelector(".hero-track");

fetch(API + "/banners")
  .then(r => r.json())
  .then(banners => {
    if (!banners.length) return;

    banners.forEach(b => {
      const img = document.createElement("img");
      img.src = b.url;
      heroTrack.appendChild(img);
    });

    setInterval(() => {
      heroIndex = (heroIndex + 1) % banners.length;
      heroTrack.style.transform = `translateX(-${heroIndex * 100}vw)`;
    }, 5000);
  });

/* ================= LOAD VIDEOS ================= */

let ALL_VIDEOS = [];

fetch(API + "/videos")
  .then(r => r.json())
  .then(videos => {
    ALL_VIDEOS = videos;
    renderVideos(videos);
  });

function renderVideos(list) {
  videosGrid.innerHTML = "";

  if (!list.length) {
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");

  list.forEach(v => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${v.name}</h3>
      <p>${v.description || ""}</p>
      <a href="#">View Details</a>
    `;

    card.querySelector("a").onclick = e => {
      e.preventDefault();
      openVideoModal(v);
    };

    videosGrid.appendChild(card);
  });
}

/* ================= SEARCH ================= */

searchInput.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();

  const filtered = ALL_VIDEOS.filter(v =>
    v.name.toLowerCase().includes(q) ||
    (v.description && v.description.toLowerCase().includes(q))
  );

  renderVideos(filtered);
});

/* ================= VIDEO MODAL ================= */

const modal = document.querySelector(".modal");
const modalBox = document.querySelector(".modal-box");
const modalContent = modalBox.querySelector("p");
const modalTitle = modalBox.querySelector("h2");
const modalClose = modalBox.querySelector(".close");

function openVideoModal(video) {
  modalTitle.textContent = video.name;

  let linksHTML = "";
  if (video.links && video.links.length) {
    linksHTML = `
      <br><br>
      ${video.links
        .map((l, i) => `<a href="${l}" target="_blank">Link ${i + 1}</a>`)
        .join("<br>")}
    `;
  }

  modalContent.innerHTML = `
    ${video.description || ""}
    <br><br>
    <a href="${video.videoLink}" target="_blank">Watch Video</a>
    ${linksHTML}
  `;

  modal.classList.remove("hidden");
}

modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
  if (e.target === modal) modal.classList.add("hidden");
};

/* ================= FOOTER MODALS ================= */

document.querySelectorAll("footer a").forEach(a => {
  a.onclick = e => {
    if (!a.dataset.text) return;
    e.preventDefault();
    modalTitle.textContent = a.textContent;
    modalContent.textContent = a.dataset.text;
    modal.classList.remove("hidden");
  };
});

/* ================= JOIN STATUS (5 MIN) ================= */

function showJoinStatus() {
  const join = document.createElement("div");
  join.className = "join";

  join.innerHTML = `
    <img src="https://cdn.discordapp.com/icons/YOUR_GUILD_ID/YOUR_ICON.gif">
    <div>
      <div>Chillaxy Community</div>
      <a href="https://discord.gg/TVPmfTdKQ9" target="_blank">Join</a>
    </div>
  `;

  document.body.appendChild(join);
  setTimeout(() => join.remove(), 5 * 60 * 1000);
}

/* ================= DASHBOARD ================= */

function toggleDash() {
  if (!IS_ADMIN) return;
  dashboardModal.classList.toggle("hidden");
}

/* ================= BRAND CLICK ================= */

document.querySelector(".brand").onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
