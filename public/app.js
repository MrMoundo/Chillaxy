const API = "https://chillaxy.up.railway.app/api";

const videosGrid = document.querySelector(".videos-grid");
const searchInput = document.querySelector(".topbar input");
const noResults = document.querySelector(".no-results");
const intro = document.getElementById("intro");
const authArea = document.getElementById("authArea");

/* dashboard elements (ممكن تكون مش موجودة) */
const dashboard = document.getElementById("dashboard");
const dashVideos = document.getElementById("dashVideos");
const dashSearch = document.getElementById("dashSearch");

let ALL_VIDEOS = [];
let CURRENT_USER = null;
let IS_ADMIN = false;

/* ===== INTRO ===== */
window.onload = () => {
  setTimeout(() => {
    if (intro) intro.style.display = "none";
  }, 2800);
};

/* ===== AUTH ===== */
fetch("/auth/me")
  .then(r => (r.status === 401 ? null : r.json()))
  .then(user => {
    if (!user) return;

    CURRENT_USER = user;
    IS_ADMIN = user.isAdmin === true;

    authArea.innerHTML = `
      <span class="user-name">👋 ${user.username}</span>
      ${
        IS_ADMIN
          ? `<button class="login-btn" id="dashBtn">Dashboard</button>`
          : ``
      }
      <a href="/auth/logout" class="login-btn">Logout</a>
    `;

    if (IS_ADMIN) {
      document.getElementById("dashBtn").onclick = toggleDash;
    }

    showJoinStatus();
  });

/* ===== HERO ===== */
let heroIndex = 0;
const heroTrack = document.querySelector(".hero-track");

fetch(API + "/banners")
  .then(r => r.json())
  .then(banners => {
    if (!banners || !banners.length) return;

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

/* ===== VIDEOS ===== */
fetch(API + "/videos")
  .then(r => r.json())
  .then(videos => {
    ALL_VIDEOS = videos || [];
    renderVideos(ALL_VIDEOS);

    if (IS_ADMIN && dashboard) {
      renderDash(ALL_VIDEOS);
    }
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
      <a href="#" data-code="${v.code}">View Details</a>
    `;

    card.querySelector("a").onclick = e => {
      e.preventDefault();
      openVideo(v);
    };

    videosGrid.appendChild(card);
  });
}

/* ===== SEARCH ===== */
searchInput.oninput = e => {
  const q = e.target.value.toLowerCase();
  renderVideos(
    ALL_VIDEOS.filter(v =>
      v.name.toLowerCase().includes(q) ||
      (v.description || "").toLowerCase().includes(q)
    )
  );
};

/* ===== VIDEO MODAL ===== */
function openVideo(v) {
  const modal = document.getElementById("videoModal");
  if (!modal) return;

  modal.querySelector("h2").innerText = v.name;
  modal.querySelector("p").innerHTML = `
    ${v.description || ""}
    <br><br>
    <a href="${v.videoLink}" target="_blank">Watch</a>
  `;
  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("videoModal");
  if (modal) modal.classList.add("hidden");
}

/* ===== JOIN STATUS ===== */
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

/* ===== DASHBOARD (ADMIN ONLY) ===== */
function toggleDash() {
  if (!IS_ADMIN || !dashboard) return;
  dashboard.classList.toggle("hidden");
}

function renderDash(list) {
  if (!dashVideos) return;

  dashVideos.innerHTML = "";

  list.forEach(v => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <h3 contenteditable
        onblur="editVideo('${v.code}','name',this.innerText)">
        ${v.name}
      </h3>
      <p contenteditable
        onblur="editVideo('${v.code}','description',this.innerText)">
        ${v.description || ""}
      </p>
      <button class="delete" onclick="deleteVideo('${v.code}')">
        Delete
      </button>
    `;
    dashVideos.appendChild(d);
  });
}

if (dashSearch) {
  dashSearch.oninput = e => {
    const q = e.target.value.toLowerCase();
    renderDash(
      ALL_VIDEOS.filter(v => v.name.toLowerCase().includes(q))
    );
  };
}

function editVideo(code, field, value) {
  if (!IS_ADMIN) return;

  fetch(API + "/videos/" + code, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [field]: value })
  });
}

function deleteVideo(code) {
  if (!IS_ADMIN) return;

  fetch(API + "/videos/" + code, { method: "DELETE" }).then(() => {
    ALL_VIDEOS = ALL_VIDEOS.filter(v => v.code !== code);
    renderVideos(ALL_VIDEOS);
    renderDash(ALL_VIDEOS);
  });
}

/* ===== BRAND ===== */
document.querySelector(".brand").onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
