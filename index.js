import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import videoRoutes from "./routes/videos.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admins.js";
import bannerRoutes from "./routes/banners.js";

import "./bot.js";

dotenv.config();

const app = express();

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
// أي حد يحاول يدخل الداشبورد من غير Login
app.get("/dashboard.html", (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
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
