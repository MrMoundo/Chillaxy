import express from "express";

const router = express.Router();

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

  req.session.user = user.id;
  res.redirect("/dashboard.html");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

export default router;
