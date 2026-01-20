import express from "express";
import fetch from "node-fetch";

const router = express.Router();

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

  if (user.id !== process.env.ADMIN_ID) {
    return res.send("Unauthorized");
  }

  res.redirect("/dashboard.html");
});

export default router;
