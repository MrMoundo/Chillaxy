import express from "express";
import session from "express-session";
import path from "path";
import authRoutes from "./routes/auth.js";
import videosRoutes from "./routes/videos.js";
import bannersRoutes from "./routes/banners.js";

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

app.listen(process.env.PORT || 3000, () => {
  console.log("Chillaxy Backend is running");
});
