<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Chillaxy</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="stylesheet" href="styles.css"/>
</head>
<body>

<!-- TOP BAR -->
<header class="topbar">
  <div class="logo">Chillaxy</div>
  <input id="search" placeholder="Search videos..." />
</header>

<!-- HERO -->
<section class="hero">
  <h1 class="glow">Chillaxy</h1>
  <p>Premium Gaming & Video Platform</p>
</section>

<!-- JOIN STATUS (TEMP) -->
<div id="joinStatus" class="join hidden">
  <img src="https://i.ibb.co/1tXTkP3N/chillaxy.gif">
  <div>
    <strong>You are in Chillaxy Community</strong>
    <br>
    <a href="https://discord.gg/TVPmfTdKQ9" target="_blank">Join</a>
  </div>
</div>

<!-- BANNERS -->
<section class="banners">
  <div class="banner-track" id="banners"></div>
</section>

<!-- VIDEOS -->
<section id="videos" class="videos"></section>

<!-- FOOTER -->
<footer>
  <div>
    <h3>Information</h3>
    <a onclick="openModal('about-us')">About Us</a>
    <a onclick="openModal('faq')">FAQ</a>
    <a onclick="openModal('careers')">Careers</a>
  </div>
  <div>
    <h3>Terms</h3>
    <a onclick="openModal('privacy-policy')">Privacy Policy</a>
    <a onclick="openModal('terms-of-service')">Terms of Service</a>
  </div>
  <div>
    <h3>Socials</h3>
    <a href="https://discord.gg/TVPmfTdKQ9" target="_blank">Discord</a>
    <a href="https://www.youtube.com/@Mr-Moundo" target="_blank">YouTube</a>
    <a href="https://instagram.com" target="_blank">Instagram</a>
    <a href="https://facebook.com" target="_blank">Facebook</a>
  </div>
</footer>

<!-- MODAL -->
<div id="infoModal" class="modal hidden">
  <div class="modal-box">
    <button class="close" onclick="closeModal()">×</button>
    <h2 id="modalTitle"></h2>
    <p id="modalContent"></p>
  </div>
</div>

<script src="app.js"></script>
</body>
</html>
