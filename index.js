import express from "express";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import videosRoutes from "./routes/videos.js";
import bannersRoutes from "./routes/banners.js";

import "./bot.js"; // 👈 يشغل البوت مع السيرفر

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use("/auth", authRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/banners", bannersRoutes);

/* 🔒 Protect dashboard */
app.get("/dashboard.html", (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect("/");
  }
  next();
});

/* ✅ who am I */
app.get("/auth/me", (req, res) => {
  if (!req.session.user) return res.status(401).json(null);
  res.json(req.session.user);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("✅ Chillaxy Backend + Bot running");
});
