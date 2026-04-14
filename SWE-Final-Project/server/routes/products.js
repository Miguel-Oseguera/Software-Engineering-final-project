import express from "express";
import { createClient } from "@libsql/client";

const router = express.Router();

// ⭐ Log env vars BEFORE creating DB client
console.log("DB URL inside products.js:", process.env.TURSO_DATABASE_URL);
console.log("AUTH inside products.js:", process.env.TURSO_AUTH_TOKEN);

// ⭐ TEST ROUTE
router.get("/test", async (req, res) => {
  try {
    const result = await db.execute("SELECT 1;");
    res.json({ success: true, result });
  } catch (err) {
    console.error("TEST ERROR:", err.message, err);
    res.status(500).json({ error: err.message });
  }
});

// ⭐ TRENDING
router.get("/trending", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT *
      FROM products
      WHERE availability = 1
      ORDER BY quantity_remaining DESC
      LIMIT 8;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Trending error:", err.message, err);
    res.status(500).json({ error: "Failed to load trending products" });
  }
});

// ⭐ NEWEST
router.get("/newest", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT *
      FROM products
      WHERE availability = 1
      ORDER BY created_at DESC
      LIMIT 8;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Newest error:", err.message, err);
    res.status(500).json({ error: "Failed to load newest products" });
  }
});

export default router;