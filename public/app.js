/* INTRO */
window.addEventListener("load", () => {
  const intro = document.getElementById("intro");
  setTimeout(() => intro.style.display = "none", 2800);
});

/* USER */
fetch("/auth/me")
  .then(r => r.json())
  .then(user => {
    if (!user) return;

    const bar = document.getElementById("userBar");
    bar.classList.remove("hidden");
    document.getElementById("userAvatar").src = user.avatar;
    document.getElementById("userName").innerText = user.username;

    if (user.isAdmin) {
      document.getElementById("adminBtn").classList.remove("hidden");
      document.getElementById("adminBtn").onclick = () => {
        window.location.href = "/dashboard.html";
      };
    }

    const stats = document.getElementById("statsBox");
    stats.classList.remove("hidden");
    setTimeout(() => stats.classList.add("hidden"), 300000);
  });

/* VIDEOS */
fetch("/api/videos")
  .then(r => r.json())
  .then(videos => {
    const grid = document.getElementById("videos");
    const noRes = document.getElementById("noResults");

    function render(list){
      grid.innerHTML = "";
      if(!list.length){
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

    render(videos);

    document.getElementById("search").oninput = e => {
      const q = e.target.value.toLowerCase();
      render(videos.filter(v => v.name.toLowerCase().includes(q)));
    };
  });

/* BANNERS */
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
