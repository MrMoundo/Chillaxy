import express from "express";
import fs from "fs-extra";

const router = express.Router();
const ADMINS_FILE = "./data/admins.json";

/* ================= LOGIN ================= */
router.get("/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    scope: "identify",
    redirect_uri: process.env.REDIRECT_URI
  });

  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

/* ================= CALLBACK ================= */
router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.send("No code provided");

    const params = new URLSearchParams();
    params.append("client_id", process.env.CLIENT_ID);
    params.append("client_secret", process.env.CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.REDIRECT_URI);

    /* TOKEN */
    const tokenRes = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      }
    );

    const token = await tokenRes.json();
    if (!token.access_token) {
      return res.send("OAuth failed");
    }

    /* USER */
    const userRes = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`
        }
      }
    );

    const user = await userRes.json();

    /* ADMIN CHECK */
    const admins = await fs.readJson(ADMINS_FILE);
    if (!admins.includes(user.id)) {
      return res.send("Unauthorized");
    }

    req.session.user = user.id;
    console.log("LOGIN USER:", user.id);

    res.redirect("/dashboard.html");
  } catch (err) {
    console.error(err);
    res.send("Authentication error");
  }
});

/* ================= LOGOUT ================= */
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

export default router;
