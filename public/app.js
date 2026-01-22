const API = "/api";
const videosEl = document.getElementById("videos");
const bannersEl = document.getElementById("banners");

/* ===== JOIN STATUS ===== */
document.getElementById("joinStatus").classList.remove("hidden");
setTimeout(()=>{
  document.getElementById("joinStatus").classList.add("hidden");
},300000);

/* ===== VIDEOS ===== */
fetch(API+"/videos")
.then(r=>r.json())
.then(videos=>{
  window.ALL_VIDEOS = videos;
  renderVideos(videos);
});

function renderVideos(list){
  videosEl.innerHTML="";
  if(!list.length){
    videosEl.innerHTML="<p>No results</p>";
    return;
  }
  list.forEach(v=>{
    const d=document.createElement("div");
    d.className="card";
    d.innerHTML=`
      <h3>${v.name}</h3>
      <p>${v.description||""}</p>
      <a href="${v.videoLink}" target="_blank">Watch</a>
    `;
    videosEl.appendChild(d);
  });
}

/* SEARCH */
document.getElementById("search").oninput=e=>{
  const q=e.target.value.toLowerCase();
  renderVideos(
    window.ALL_VIDEOS.filter(v=>v.name.toLowerCase().includes(q))
  );
};

/* ===== BANNERS ===== */
fetch(API+"/banners")
.then(r=>r.json())
.then(banners=>{
  banners.forEach(b=>{
    const img=document.createElement("img");
    img.src=b.url;
    bannersEl.appendChild(img);
  });
  let i=0;
  setInterval(()=>{
    i=(i+1)%banners.length;
    bannersEl.style.transform=`translateX(-${i*440}px)`;
  },4000);
});

/* ===== MODAL CONTENT ===== */
const modal=document.getElementById("infoModal");
const title=document.getElementById("modalTitle");
const content=document.getElementById("modalContent");

const DATA={
  "about-us":{
    t:"About Us",
    c:"Welcome to Chillaxy Community!\nA safe gaming & content hub."
  },
  "faq":{
    t:"FAQ",
    c:"What is Chillaxy?\nA premium community.\n\nSelf bots?\nIllegal tools."
  },
  "careers":{
    t:"Careers",
    c:"No open roles currently.\nStay tuned!"
  },
  "privacy-policy":{
    t:"Privacy Policy",
    c:"We do not collect personal data."
  },
  "terms-of-service":{
    t:"Terms of Service",
    c:"Use tools responsibly.\nNo liability."
  }
};

function openModal(key){
  title.innerText=DATA[key].t;
  content.innerText=DATA[key].c;
  modal.classList.remove("hidden");
}
function closeModal(){
  modal.classList.add("hidden");
}
