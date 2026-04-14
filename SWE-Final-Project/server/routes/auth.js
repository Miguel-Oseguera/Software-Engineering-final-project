import express from "express";
import db from "../db/index.js";

const router = express.Router();


// 🔐 LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("LOGIN:", username, password); // debug

  try {
    const result = await db.execute({
      sql: "SELECT * FROM auth_users WHERE username = ? AND password = ?",
      args: [username, password],
    });

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).send("Login error");
  }
});


// 🆕 REGISTER
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  console.log("REGISTER:", username, password, email); // debug

  // basic check to avoid undefined error
  if (!username || !password || !email) {
    return res.status(400).send("Missing fields");
  }

  try {
    await db.execute({
      sql: "INSERT INTO auth_users (username, password, email) VALUES (?, ?, ?)",
      args: [username, password, email],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).send("Error creating user");
  }
});


// (optional) test route so /auth works in browser
router.get("/", (req, res) => {
  res.send("Auth route working");
});

export default router;