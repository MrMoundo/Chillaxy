import express from "express";
import fs from "fs-extra";

const router = express.Router();
const ADMINS_FILE = "./data/admins.json";
const AUTO_ROLE_ID = "1352081296154824744";

async function assignAutoRole(userId){
  const guildId = process.env.GUILD_ID;
  const botToken = process.env.BOT_TOKEN;

  if (!guildId || !botToken || !userId) return;

  const endpoint = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${AUTO_ROLE_ID}`;

  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`
      }
    });

    if (!response.ok && response.status !== 404) {
      console.error("Failed to auto-assign role", {
        userId,
        status: response.status
      });
    }
  } catch (error) {
    console.error("Failed to auto-assign role", { userId, error });
  }
}

/* ===== LOGIN ===== */
router.get("/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    scope: "identify",
    redirect_uri: process.env.REDIRECT_URI
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

/* ===== CALLBACK ===== */
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
  const admins = await fs.readJson(ADMINS_FILE);

  req.session.user = {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    isAdmin: admins.includes(user.id)
  };

  await assignAutoRole(user.id);

  res.redirect("/");
});

/* ===== CURRENT USER ===== */
router.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).json(null);
  res.json(req.session.user);
});

/* ===== LOGOUT ===== */
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

export default router;
