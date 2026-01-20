import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import fs from "fs-extra";

import videoRoutes from "./routes/videos.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admins.js";
import bannerRoutes from "./routes/banners.js";

import "./bot.js";

dotenv.config();

const app = express();
const ADMINS_FILE = "./data/admins.json";

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false
  }
}));

/* ================= ROUTES ================= */

app.use("/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/banners", bannerRoutes);

/* ================= PROTECT DASHBOARD ================= */
app.get("/dashboard.html", async (req, res, next) => {
  // مش عامل login
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  // مش admin
  const admins = await fs.readJson(ADMINS_FILE);
  if (!admins.includes(req.session.user)) {
    return res.status(403).send("Forbidden");
  }

  next();
});

/* ================= STATIC FILES ================= */

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Chillaxy Backend is running");
});

/* ================= LISTEN ================= */

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
