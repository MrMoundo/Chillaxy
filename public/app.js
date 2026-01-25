const API = "https://chillaxy.up.railway.app/api";

/* ================= ELEMENTS ================= */

const videosGrid = document.querySelector(".videos-grid");
const searchInput = document.querySelector(".topbar input");
const noResults = document.querySelector(".no-results");
const intro = document.getElementById("intro");
const authArea = document.getElementById("authArea");

const dashboard = document.getElementById("dashboard");
const dashVideos = document.getElementById("dashVideos");
const dashSearch = document.getElementById("dashSearch");

/* ================= STATE ================= */

let ALL_VIDEOS = [];
let CURRENT_USER = null;
let IS_ADMIN = false;

/* ================= INTRO ================= */

window.onload = () => {
  setTimeout(() => {
    if (intro) intro.style.display = "none";
  }, 2800);
};

/* ================= AUTH ================= */

fetch("/auth/me")
  .then(r => (r.status === 401 ? null : r.json()))
  .then(user => {
    if (!user) return;

    CURRENT_USER = user;
    IS_ADMIN = user.isAdmin === true;

    authArea.innerHTML = `
      <span class="user-name">👋 ${user.username}</span>
      ${IS_ADMIN ? `<button class="login-btn" id="dashBtn">Dashboard</button>` : ``}
      <a href="/auth/logout" class="login-btn">Logout</a>
    `;

    if (IS_ADMIN) {
      document.getElementById("dashBtn").onclick = toggleDash;
    }

    showJoinStatus();
  });

/* ================= HERO (ONE BANNER) ================= */

const heroTrack = document.querySelector(".hero-track");
let heroIndex = 0;

fetch(API + "/banners")
  .then(r => r.json())
  .then(banners => {
    if (!banners || !banners.length) return;

    const img = document.createElement("img");
    img.src = banners[0].url;
    heroTrack.appendChild(img);

    setInterval(() => {
      heroIndex = (heroIndex + 1) % banners.length;
      img.src = banners[heroIndex].url;
    }, 5000);
  });

/* ================= HELPERS ================= */

function getYoutubeId(url){
  try{
    return url.split("v=")[1].split("&")[0];
  }catch{
    return null;
  }
}

function getYoutubeThumb(url){
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

/* ================= VIDEOS ================= */

fetch(API + "/videos")
  .then(r => r.json())
  .then(videos => {
    ALL_VIDEOS = videos || [];
    renderVideos(ALL_VIDEOS);
    if (IS_ADMIN && dashboard) renderDash(ALL_VIDEOS);
  });

function renderVideos(list){
  videosGrid.innerHTML = "";

  if (!list.length){
    noResults.classList.remove("hidden");
    return;
  }
  noResults.classList.add("hidden");

  list.forEach(v => {
    const card = document.createElement("div");
    card.className = "video-card normal";

    card.innerHTML = `
      <img src="${getYoutubeThumb(v.videoLink)}">
      <div class="info">
        <h3>${v.name}</h3>
        <button class="watch-btn">WATCH</button>
      </div>
    `;

    card.querySelector(".watch-btn").onclick = e => {
      e.stopPropagation();
      openVideo(v);
    };

    videosGrid.appendChild(card);
  });
}

/* ================= SEARCH ================= */

searchInput.oninput = e => {
  const q = e.target.value.toLowerCase();
  renderVideos(
    ALL_VIDEOS.filter(v =>
      v.name.toLowerCase().includes(q) ||
      (v.description || "").toLowerCase().includes(q)
    )
  );
};

/* ================= MODAL ================= */

function openVideo(v){
  const modal = document.getElementById("videoModal");
  const id = getYoutubeId(v.videoLink);

  modal.querySelector("h2").innerText = v.name;
  modal.querySelector("p").innerHTML = `
    <div class="modal-video">
      <iframe
        src="https://www.youtube.com/embed/${id}"
        allowfullscreen
      ></iframe>
    </div>
    <p>${v.description || ""}</p>
  `;

  modal.classList.remove("hidden");
}

function closeModal(){
  document.getElementById("videoModal").classList.add("hidden");
}

/* ================= JOIN ================= */

function showJoinStatus(){
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
  setTimeout(()=>join.remove(),300000);
}

/* ================= DASHBOARD ================= */

function toggleDash(){
  if(!IS_ADMIN) return;
  dashboard.classList.toggle("hidden");
}

function renderDash(list){
  dashVideos.innerHTML = "";

  list.forEach(v => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <strong>${v.name}</strong>
      <small>ID: ${v.code}</small>
      <textarea onblur="editVideo('${v.code}','description',this.value)">
        ${v.description || ""}
      </textarea>
      <div class="dash-actions">
        <button onclick="deleteVideo('${v.code}')">Delete</button>
      </div>
    `;
    dashVideos.appendChild(d);
  });
}

if (dashSearch){
  dashSearch.oninput = e => {
    const q = e.target.value.toLowerCase();
    renderDash(ALL_VIDEOS.filter(v => v.name.toLowerCase().includes(q)));
  };
}

function editVideo(code, field, value){
  if(!IS_ADMIN) return;
  fetch(API + "/videos/" + code, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [field]: value })
  });
}

function deleteVideo(code){
  if(!IS_ADMIN) return;
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
