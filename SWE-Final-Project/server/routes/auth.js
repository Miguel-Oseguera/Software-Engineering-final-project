import express from "express";
import db from "../db/index.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.execute({
      sql: "SELECT * FROM auth_users WHERE username = ? AND password = ?",
      args: [username, password],
    });

    if (result.rows.length > 0) {
      const user = result.rows[0];

      res.json({
        success: true,
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: Number(user.is_admin || 0),
      });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await db.execute({
      sql: `
        INSERT INTO auth_users (username, password, email, is_admin)
        VALUES (?, ?, ?, 0)
      `,
      args: [username, password, email],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Error creating user" });
  }
});

router.get("/", (req, res) => {
  res.send("Auth route working");
});

export default router;