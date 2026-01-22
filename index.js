import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/videos.js";
import bannerRoutes from "./routes/banners.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ===== SESSION ===== */
app.use(session({
  secret: process.env.SESSION_SECRET || "chillaxy_secret",
  resave: false,
  saveUninitialized: false
}));

/* ===== MIDDLEWARE ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== STATIC FRONTEND ===== */
app.use(express.static(path.join(__dirname, "public")));

/* ===== API ROUTES ===== */
app.use("/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/banners", bannerRoutes);

/* ===== FALLBACK ===== */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Chillaxy Backend running on port", PORT);
});
