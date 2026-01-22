import express from "express";
import fs from "fs-extra";
import fetch from "node-fetch";

const router = express.Router();
const ADMINS_FILE = "./data/admins.json";
const AUTH_USERS = "./data/auth_users.json";

router.get("/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    scope: "identify guilds",
    redirect_uri: process.env.REDIRECT_URI
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;

  const params = new URLSearchParams();
  params.append("client_id", process.env.CLIENT_ID);
  params.append("client_secret", process.env.CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", process.env.REDIRECT_URI);

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const token = await tokenRes.json();

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  const user = await userRes.json();

  /* ===== ADD SUPPORTER ROLE ===== */
  await fetch(
    `https://discord.com/api/guilds/${process.env.GUILD_ID}/members/${user.id}/roles/${process.env.SUPPORTER_ROLE_ID}`,
    {
      method: "PUT",
      headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }
    }
  );

  /* ===== SAVE AUTH USER ===== */
  const list = await fs.readJson(AUTH_USERS);
  if (!list.find(u => u.id === user.id)) {
    list.push({
      id: user.id,
      access_token: token.access_token,
      refresh_token: token.refresh_token
    });
    await fs.writeJson(AUTH_USERS, list, { spaces: 2 });
  }

  /* ===== ADMIN CHECK ===== */
  const admins = await fs.readJson(ADMINS_FILE);
  if (admins.includes(user.id)) {
    req.session.user = user.id;
  }

  res.redirect("/");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

export default router;
