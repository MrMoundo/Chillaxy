import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import fs from "fs-extra";
import fetch from "node-fetch";

import videoRoutes from "./routes/videos.js";
import bannerRoutes from "./routes/banners.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admins.js";

import "./bot.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(express.static("public"));

app.use("/api/videos", videoRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/admins", adminRoutes);
app.use("/auth", authRoutes);

/* ===== STATUS ===== */
app.get("/auth/status", (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

/* ===== SUPPORTERS COUNT ===== */
app.get("/api/supporters-count", async (req, res) => {
  const users = await fs.readJson("./data/auth_users.json");
  res.json({ count: users.length });
});

/* ===== BACKGROUND CHECK (REMOVE ROLE IF AUTH REMOVED) ===== */
setInterval(async () => {
  const users = await fs.readJson("./data/auth_users.json");
  const valid = [];

  for (const u of users) {
    const r = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${u.access_token}` }
    });

    if (r.status === 401) {
      await fetch(
        `https://discord.com/api/guilds/${process.env.GUILD_ID}/members/${u.id}/roles/${process.env.SUPPORTER_ROLE_ID}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }
        }
      );
    } else {
      valid.push(u);
    }
  }

  await fs.writeJson("./data/auth_users.json", valid, { spaces: 2 });
}, 10 * 60 * 1000);

app.listen(process.env.PORT || 3000, () => {
  console.log("Chillaxy Backend is running");
});
