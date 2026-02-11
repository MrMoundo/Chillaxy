const API = "https://chillaxy.up.railway.app/api";

/* ================= ELEMENTS ================= */

const videosGrid = document.querySelector(".videos-grid");
const searchInput = document.querySelector(".topbar input");
const noResults = document.querySelector(".no-results");
const intro = document.getElementById("intro");
const authArea = document.getElementById("authArea");

const infoGrid = document.getElementById("infoGrid");
const infoModal = document.getElementById("infoModal");

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

const infoData = {
  about: [
    {
      name: "About Us",
      link: "#about-us",
      description:
        "مرحبًا بك في سيرفر شلاكسي! نحن مجتمع يجمع بين عشاق الدردشة والتفاعل، نوفر بيئة ممتعة وآمنة للجميع. يهدف السيرفر إلى تقديم تجربة رائعة لكل الأعضاء، مع الالتزام بالقوانين لحماية الجميع."
    },
    {
      name: "FAQ",
      link: "#faq",
      description:
        "1. ما هو سيرفر Chillaxy Community؟ سيرفر مجتمع يجمع محبي التفاعل والتواصل في بيئة آمنة وخالية من المشاكل.\n2. ما هي أدوات السيلف بوت؟ السيلف بوت (Self Bot) هي أدوات غير قانونية تستخدم لتشغيل سكربتات داخل ديسكورد بشكل غير مسموح به.\n3. لماذا يُمنع استخدام السيلف بوت؟ يخالف قوانين ديسكورد وقد يؤدي لحظر حسابك نهائيًا.\n4. كيف أحمي نفسي من أدوات السيلف بوت؟ لا تثق بأي أداة تعدك بميزات غير رسمية لديسكورد."
    },
    {
      name: "Careers",
      link: "#careers",
      description:
        "حاليًا، لا يوجد وظائف متاحة، لكننا دائمًا نبحث عن أشخاص موهوبين للمساعدة في تطوير المجتمع. إذا كنت مهتمًا بالمساهمة، تابع قنوات الإعلانات في السيرفر لمعرفة الفرص المتاحة قريبًا!"
    }
  ],
  terms: [
    {
      name: "Privacy Shield",
      link: "#privacy-shield",
      description:
        "نحن نأخذ خصوصية أعضائنا على محمل الجد. لا نقوم بجمع أو مشاركة بياناتك مع أي طرف ثالث، ونضمن حماية معلوماتك داخل السيرفر والموقع. لا تثق بأي شخص يطلب منك بياناتك الشخصية."
    },
    {
      name: "Privacy Policy",
      link: "#privacy-policy",
      description:
        "لا نطلب أي معلومات شخصية من الأعضاء. نحترم سرية بيانات المستخدمين ونمنع أي استخدام غير مصرح به. في حالة وجود أي نشاط مريب، يرجى التبليغ فورًا للإدارة داخل السيرفر."
    },
    {
      name: "Terms of Service",
      link: "#terms-of-service",
      description:
        "الأدوات المتاحة هنا للتجربة والتعلم فقط، ولا ننصح باستخدامها في حساباتك الأساسية. لا نتحمل مسؤولية أي حظر أو ضرر قد يحدث نتيجة لاستخدام السيلف بوت. إساءة استخدام الأدوات قد تؤدي إلى حظر حسابك  ديسكورد نهائيًا."
    }
  ],
  socials: [
    { name: "Discord", link: "https://discord.gg/TVPmfTdKQ9" },
    { name: "Twitter", link: "https://twitter.com" },
    { name: "YouTube", link: "https://www.youtube.com/@Mr-Moundo" },
    { name: "Instagram", link: "https://instagram.com" },
    { name: "Facebook", link: "https://facebook.com" }
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

/* ================= BRAND ================= */

document.querySelector(".brand").onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

