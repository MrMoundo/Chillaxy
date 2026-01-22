import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

/* ROUTES */
import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/videos.js";
import bannerRoutes from "./routes/banners.js";

/* BOT */
import "./bot.js";

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false
    }
  })
);

/* ================= ROUTES ================= */
app.use("/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/banners", bannerRoutes);

/* ================= FRONTEND ================= */
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Chillaxy Backend is running");
});
