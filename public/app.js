const API = "https://chillaxy.up.railway.app/api";
const videosEl = document.getElementById("videos");
const search = document.getElementById("search");
const noResults = document.getElementById("noResults");

/* ===== INTRO FIX ===== */
window.addEventListener("load", () => {
  const intro = document.getElementById("intro");
  setTimeout(() => {
    intro.style.display = "none";
  }, 2800);
});

/* ===== LOAD VIDEOS ===== */
let allVideos = [];

fetch(API + "/videos")
  .then(r => r.json())
  .then(videos => {
    allVideos = videos;
    renderVideos(videos);
  });

function renderVideos(list){
  videosEl.innerHTML = "";
  if(!list.length){
    noResults.classList.remove("hidden");
    return;
  }
  noResults.classList.add("hidden");

  list.forEach(v => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <h3>${v.name}</h3>
      <p>${v.description || ""}</p>
      <a href="${v.videoLink}" target="_blank">Watch</a>
    `;
    videosEl.appendChild(d);
  });
}

/* ===== SEARCH ===== */
search.addEventListener("input", () => {
  const q = search.value.toLowerCase();
  const filtered = allVideos.filter(v =>
    v.name.toLowerCase().includes(q)
  );
  renderVideos(filtered);
});

/* ===== MODAL CONTENT ===== */
const modalData = {
  about: {
    title: "About Chillaxy",
    content: "Chillaxy is a premium Discord-powered platform for gaming and video content."
  },
  faq: {
    title: "FAQ",
    content: "This platform is managed through Discord bots and admin dashboards."
  },
  careers: {
    title: "Careers",
    content: "No open positions currently."
  },
  privacy: {
    title: "Privacy Policy",
    content: "We respect your privacy and do not collect personal data."
  },
  tos: {
    title: "Terms of Service",
    content: "Use content responsibly. We are not responsible for misuse."
  }
};

function openModal(key){
  document.getElementById("modalTitle").innerText = modalData[key].title;
  document.getElementById("modalContent").innerText = modalData[key].content;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal(){
  document.getElementById("modal").classList.add("hidden");
}
