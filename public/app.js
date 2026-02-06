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
const statTotal = document.getElementById("statTotal");
const statFiltered = document.getElementById("statFiltered");
const statSync = document.getElementById("statSync");
const refreshDash = document.getElementById("refreshDash");
const scrollTopDash = document.getElementById("scrollTopDash");

const CACHE_VIDEOS_KEY = "chillaxy-videos";
const CACHE_BANNERS_KEY = "chillaxy-banners";
const CACHE_SEARCH_KEY = "chillaxy-search";
const CACHE_DASH_SEARCH_KEY = "chillaxy-dash-search";

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
      if (ALL_VIDEOS.length) applyDashFilter();
    }

    showJoinStatus();
  });

/* ================= HERO (ONE BANNER) ================= */

const heroTrack = document.querySelector(".hero-track");
let heroIndex = 0;
let heroImages = [];

const cachedBanners = localStorage.getItem(CACHE_BANNERS_KEY);
if (cachedBanners){
  try{
    const parsed = JSON.parse(cachedBanners);
    if (Array.isArray(parsed) && parsed.length){
      setupBanners(parsed);
    }
  }catch{
    localStorage.removeItem(CACHE_BANNERS_KEY);
  }
}

fetch(API + "/banners")
  .then(r => r.json())
  .then(banners => {
    if (!banners || !banners.length) return;

    localStorage.setItem(CACHE_BANNERS_KEY, JSON.stringify(banners));
    setupBanners(banners);
  });

function setupBanners(banners){
  heroTrack.innerHTML = "";
  heroImages = banners.map((banner, index) => {
    const img = document.createElement("img");
    img.src = banner.url;
    if (index === 0) img.classList.add("active");
    heroTrack.appendChild(img);
    return img;
  });

  if (heroImages.length > 1){
    setInterval(() => {
      heroImages[heroIndex].classList.remove("active");
      heroIndex = (heroIndex + 1) % heroImages.length;
      heroImages[heroIndex].classList.add("active");
    }, 6000);
  } else if (heroImages.length === 1){
    heroImages[0].classList.add("active");
  }
}

/* ================= HELPERS ================= */

function getYoutubeId(url){
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
  return match ? match[1] : null;
}

function getYoutubeThumb(url){
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "https://placehold.co/640x360?text=Chillaxy";
}

/* ================= VIDEOS ================= */

const cachedVideos = localStorage.getItem(CACHE_VIDEOS_KEY);
if (cachedVideos){
  try{
    const parsed = JSON.parse(cachedVideos);
    if (Array.isArray(parsed) && parsed.length){
      ALL_VIDEOS = parsed;
      renderVideos(ALL_VIDEOS);
      if (IS_ADMIN && dashboard) renderDash(ALL_VIDEOS);
    }
  }catch{
    localStorage.removeItem(CACHE_VIDEOS_KEY);
  }
}

fetch(API + "/videos")
  .then(r => r.json())
  .then(videos => {
    ALL_VIDEOS = videos || [];
    localStorage.setItem(CACHE_VIDEOS_KEY, JSON.stringify(ALL_VIDEOS));
    renderVideos(ALL_VIDEOS);
    if (IS_ADMIN && dashboard) applyDashFilter();
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
      <img src="${getYoutubeThumb(v.videoLink)}" alt="${v.name}">
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
  localStorage.setItem(CACHE_SEARCH_KEY, q);
  renderVideos(
    ALL_VIDEOS.filter(v =>
      v.name.toLowerCase().includes(q) ||
      (v.description || "").toLowerCase().includes(q)
    )
  );
};

const savedSearch = localStorage.getItem(CACHE_SEARCH_KEY);
if (savedSearch){
  searchInput.value = savedSearch;
  searchInput.dispatchEvent(new Event("input"));
}

/* ================= MODAL ================= */

function openVideo(v){
  const modal = document.getElementById("videoModal");
  const id = getYoutubeId(v.videoLink);

  modal.querySelector("h2").innerText = v.name;
  modal.querySelector("p").innerHTML = `
    <div class="modal-video">
      ${id ? `
        <iframe
          src="https://www.youtube.com/embed/${id}"
          allowfullscreen
        ></iframe>
      ` : `<div class="no-video">Video link غير صالح</div>`}
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
  if (statTotal) statTotal.innerText = ALL_VIDEOS.length;
  if (statFiltered) statFiltered.innerText = list.length;
  if (statSync) statSync.innerText = new Date().toLocaleTimeString();

  list.forEach(v => {
    const d = document.createElement("div");
    d.className = "card";
    const img = document.createElement("img");
    img.src = getYoutubeThumb(v.videoLink);
    img.alt = v.name;

    const content = document.createElement("div");
    content.className = "card-content";

    const title = document.createElement("strong");
    title.innerText = v.name;

    const code = document.createElement("small");
    code.innerText = `ID: ${v.code}`;

    const link = document.createElement("small");
    link.innerText = `Video Link: ${v.videoLink || "-"}`;

    const textarea = document.createElement("textarea");
    textarea.value = v.description || "";
    textarea.onblur = () => editVideo(v.code, "description", textarea.value);

    const actions = document.createElement("div");
    actions.className = "dash-actions";

    const preview = document.createElement("button");
    preview.className = "secondary";
    preview.innerText = "Preview";
    preview.onclick = () => openVideo(v);

    const del = document.createElement("button");
    del.innerText = "Delete";
    del.onclick = () => deleteVideo(v.code);

    actions.append(preview, del);
    content.append(title, code, link, textarea, actions);
    d.append(img, content);
    dashVideos.appendChild(d);
  });
}

if (dashSearch){
  dashSearch.oninput = e => {
    const q = e.target.value.toLowerCase();
    localStorage.setItem(CACHE_DASH_SEARCH_KEY, q);
    renderDash(ALL_VIDEOS.filter(v => v.name.toLowerCase().includes(q)));
  };
}

const savedDashSearch = localStorage.getItem(CACHE_DASH_SEARCH_KEY);
if (dashSearch && savedDashSearch){
  dashSearch.value = savedDashSearch;
}

function applyDashFilter(){
  if (!dashSearch) return;
  const q = dashSearch.value.toLowerCase();
  renderDash(ALL_VIDEOS.filter(v => v.name.toLowerCase().includes(q)));
}

function editVideo(code, field, value){
  if(!IS_ADMIN) return;
  ALL_VIDEOS = ALL_VIDEOS.map(v => (v.code === code ? { ...v, [field]: value } : v));
  localStorage.setItem(CACHE_VIDEOS_KEY, JSON.stringify(ALL_VIDEOS));
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
      localStorage.setItem(CACHE_VIDEOS_KEY, JSON.stringify(ALL_VIDEOS));
      renderVideos(ALL_VIDEOS);
      renderDash(ALL_VIDEOS);
    });
}

/* ================= BRAND ================= */

document.querySelector(".brand").onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

if (refreshDash){
  refreshDash.onclick = () => {
    fetch(API + "/videos")
      .then(r => r.json())
      .then(videos => {
        ALL_VIDEOS = videos || [];
        localStorage.setItem(CACHE_VIDEOS_KEY, JSON.stringify(ALL_VIDEOS));
        applyDashFilter();
        renderVideos(ALL_VIDEOS);
      });
  };
}

if (scrollTopDash){
  scrollTopDash.onclick = () => {
    dashboard.querySelector(".modal-box").scrollTo({ top: 0, behavior: "smooth" });
  };
}
