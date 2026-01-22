/* ================= CONFIG ================= */

const API = "https://chillaxy.up.railway.app/api";

const videosGrid = document.querySelector(".videos-grid");
const searchInput = document.querySelector(".topbar input");
const noResults = document.querySelector(".no-results");
const intro = document.getElementById("intro");

const authArea = document.getElementById("authArea");
const dashboardModal = document.getElementById("dashboard");
const dashVideos = document.getElementById("dashVideos");
const dashSearch = document.getElementById("dashSearch");

/* ================= INTRO ================= */

window.addEventListener("load", () => {
  setTimeout(() => {
    intro.style.display = "none";
  }, 2800);
});

/* ================= AUTH ================= */

let CURRENT_USER = null;
let IS_ADMIN = false;

fetch("/auth/me")
  .then(r => r.json())
  .then(user => {
    if (!user) return;

    CURRENT_USER = user;
    IS_ADMIN = user.isAdmin;

    authArea.innerHTML = `
      <span class="user-name">👋 ${user.username}</span>
      ${IS_ADMIN ? `<button class="login-btn" onclick="toggleDash()">Dashboard</button>` : ""}
      <a href="/auth/logout" class="login-btn">Logout</a>
    `;

    showJoinStatus();
  });

/* ================= HERO ================= */

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

/* ================= VIDEOS ================= */

let ALL_VIDEOS = [];

fetch(API + "/videos")
  .then(r => r.json())
  .then(videos => {
    ALL_VIDEOS = videos;
    renderVideos(videos);
    renderDash(videos);
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
      <a href="${v.videoLink}" target="_blank">Watch</a>
    `;

    videosGrid.appendChild(card);
  });
}

/* ================= SEARCH ================= */

searchInput.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderVideos(
    ALL_VIDEOS.filter(v =>
      v.name.toLowerCase().includes(q) ||
      (v.description && v.description.toLowerCase().includes(q))
    )
  );
});

/* ================= JOIN STATUS ================= */

function showJoinStatus() {
  const join = document.createElement("div");
  join.className = "join";

  join.innerHTML = `
    <img src="https://cdn.discordapp.com/embed/avatars/0.png">
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

function renderDash(list) {
  dashVideos.innerHTML = "";

  if (!list.length) {
    dashVideos.innerHTML = "<p style='color:#aaa'>No videos</p>";
    return;
  }

  list.forEach(v => {
    const d = document.createElement("div");
    d.className = "card";

    d.innerHTML = `
      <h3 contenteditable onblur="editVideo('${v.code}','name',this.innerText)">
        ${v.name}
      </h3>
      <p contenteditable onblur="editVideo('${v.code}','description',this.innerText)">
        ${v.description || ""}
      </p>
      <button class="delete" onclick="deleteVideo('${v.code}')">Delete</button>
    `;

    dashVideos.appendChild(d);
  });
}

dashSearch.oninput = e => {
  const q = e.target.value.toLowerCase();
  renderDash(ALL_VIDEOS.filter(v => v.name.toLowerCase().includes(q)));
};

function editVideo(code, field, value) {
  fetch(API + "/videos/" + code, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [field]: value })
  });
}

function deleteVideo(code) {
  fetch(API + "/videos/" + code, { method: "DELETE" })
    .then(() => {
      ALL_VIDEOS = ALL_VIDEOS.filter(v => v.code !== code);
      renderVideos(ALL_VIDEOS);
      renderDash(ALL_VIDEOS);
    });
}

/* ================= BRAND ================= */

document.querySelector(".brand").onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
