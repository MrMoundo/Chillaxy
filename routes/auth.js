import express from "express";
import fs from "fs-extra";

const router = express.Router();
const ADMINS_FILE = "./data/admins.json";

router.get("/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    scope: "identify",
    redirect_uri: process.env.REDIRECT_URI
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI
    })
  });

  const token = await tokenRes.json();

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  const user = await userRes.json();
  const admins = await fs.readJson(ADMINS_FILE);

  req.session.user = {
    id: user.id,
    username: user.username,
    avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
    isAdmin: admins.includes(user.id)
  };

  res.redirect("/");
});

router.get("/me", (req, res) => {
  res.json(req.session.user || null);
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

export default router;
