const API = "https://chillaxy.up.railway.app/api";

/* ================= ELEMENTS ================= */

const videosGrid = document.querySelector(".videos-grid");
const searchInput = document.querySelector(".topbar input");
const noResults = document.querySelector(".no-results");
const intro = document.getElementById("intro");
const authArea = document.getElementById("authArea");

const infoGrid = document.getElementById("infoGrid");
const infoModal = document.getElementById("infoModal");

const autoRoleCount = document.getElementById("autoRoleCount");

const CACHE_VIDEOS_KEY = "chillaxy-videos";
const CACHE_BANNERS_KEY = "chillaxy-banners";
const CACHE_SEARCH_KEY = "chillaxy-search";

/* ================= STATE ================= */

let ALL_VIDEOS = [];

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

    authArea.innerHTML = `
      <span class="user-name">👋 ${user.username}</span>
      <a href="/auth/logout" class="login-btn">Logout</a>
    `;

    showJoinStatus();
  });

fetch("/auth/role-info")
  .then(r => r.json())
  .then(data => {
    if (!data) return;

    if (autoRoleCount) {
      if (typeof data.count === "number") {
        autoRoleCount.innerText = `${data.count}`;
      } else {
        autoRoleCount.innerText = "0";
      }
    }
  })
  .catch(() => {
    if (autoRoleCount) {
      autoRoleCount.innerText = "0";
    }
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
  });

function renderVideos(list){
  videosGrid.innerHTML = "";

  if (!list.length){
    if (noResults) noResults.classList.remove("hidden");
    return;
  }
  if (noResults) noResults.classList.add("hidden");

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

function normalizeText(value){
  return (value || "").toString().toLowerCase().trim();
}

if (searchInput){
  searchInput.oninput = e => {
    const q = normalizeText(e.target.value);
    localStorage.setItem(CACHE_SEARCH_KEY, q);
    renderVideos(
      ALL_VIDEOS.filter(v =>
        normalizeText(v.name).includes(q) ||
        normalizeText(v.description).includes(q)
      )
    );
  };
}

const savedSearch = localStorage.getItem(CACHE_SEARCH_KEY);
if (savedSearch && searchInput){
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

function closeInfoModal(){
  if (infoModal) infoModal.classList.add("hidden");
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

/* ================= INFO DATA ================= */

const infoData = {
  about: [
    {
      name: "About Chillaxy",
      description: "Chillaxy provides curated premium video content for the community.",
      link: "https://discord.gg/TVPmfTdKQ9"
    }
  ],
  terms: [
    {
      name: "Privacy Policy",
      description: "How user data is collected and handled.",
      link: "#"
    },
    {
      name: "Terms of Service",
      description: "Rules and conditions for using Chillaxy.",
      link: "#"
    }
  ],
  socials: [
    { name: "Discord", description: "Join our Discord community.", link: "https://discord.gg/TVPmfTdKQ9" },
    { name: "Twitter", description: "Follow updates on X / Twitter.", link: "https://twitter.com" },
    { name: "YouTube", description: "Watch clips and videos.", link: "https://youtube.com" },
    { name: "Instagram", description: "See posts and stories.", link: "https://instagram.com" },
    { name: "Facebook", description: "Stay connected on Facebook.", link: "https://facebook.com" }
  ]
};

function renderInfoCards(){
  if (!infoGrid) return;
  const items = [
    ...infoData.about.map(item => ({ ...item, group: "About" })),
    ...infoData.terms.map(item => ({ ...item, group: "Terms" })),
    ...infoData.socials.map(item => ({ ...item, group: "Social" }))
  ];

  infoGrid.innerHTML = "";
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "info-card";
    card.innerHTML = `
      <span>${item.group}</span>
      <strong>${item.name}</strong>
      <p>${item.description || "Open link"}</p>
    `;
    card.onclick = () => openInfoModal(item);
    infoGrid.appendChild(card);
  });
}

function openInfoModal(item){
  if (!infoModal) return;
  infoModal.querySelector("h2").innerText = item.name;
  infoModal.querySelector("p").innerText = item.description || "Open link";
  const link = infoModal.querySelector(".info-link");
  link.href = item.link || "#";
  link.innerText = item.link ? "Open link" : "No link";
  infoModal.classList.remove("hidden");
}

renderInfoCards();

document.querySelector(".brand").onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
