import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/videos.js";
import adminRoutes from "./routes/admins.js";
import bannerRoutes from "./routes/banners.js";

dotenv.config();

const app = express();

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

/* ===== ROUTES ===== */
app.use("/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/banners", bannerRoutes);

/* ===== AUTH CHECK API ===== */
app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ loggedIn: false });
  }
  res.json({ loggedIn: true, userId: req.session.user });
});

/* ===== DASHBOARD PROTECTION ===== */
app.get("/dashboard.html", (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
});

/* ===== STATIC FILES ===== */
app.use(express.static("public"));

/* ===== ROOT ===== */
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Chillaxy Backend running on port", PORT);
});
