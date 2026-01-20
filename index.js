import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import videoRoutes from "./routes/videos.js";
import authRoutes from "./routes/auth.js";
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

app.use("/auth", authRoutes);

app.use("/api/videos", (req, res, next) => {
  if (req.method !== "GET" && req.session.user !== process.env.ADMIN_ID) {
    return res.sendStatus(403);
  }
  next();
}, videoRoutes);

app.use((req, res, next) => {
  if (req.path === "/dashboard.html") {
    if (req.session.user !== process.env.ADMIN_ID) {
      return res.redirect("/auth/login");
    }
  }
  next();
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Chillaxy Backend is running");
});

app.listen(process.env.PORT || 3000);
