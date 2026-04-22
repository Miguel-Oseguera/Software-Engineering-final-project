import express from "express";
import db from "../db/index.js";

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    const result = await db.execute("SELECT 1;");
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT * FROM products WHERE availability = 1 ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load products" });
  }
});

router.get("/trending", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT * FROM products
      WHERE availability = 1
      ORDER BY quantity_remaining DESC
      LIMIT 8;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load trending products" });
  }
});

router.get("/newest", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT * FROM products
      WHERE availability = 1
      ORDER BY created_at DESC
      LIMIT 8;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load newest products" });
  }
});

router.get("/seller/:username", async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM products WHERE seller = ? AND availability = 1 ORDER BY created_at DESC",
      args: [req.params.username],
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load listings" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM products WHERE id = ?",
      args: [req.params.id],
    });
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to load product" });
  }
});

router.post("/", async (req, res) => {
  const { name, price, description, imageUrl, quantity, seller } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name and price are required" });
  try {
    const images = imageUrl ? JSON.stringify([imageUrl]) : "[]";
    const id = Date.now();
    await db.execute({
      sql: `INSERT INTO products (id, name, price, description, images, availability, quantity_remaining, seller)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      args: [id, name, parseFloat(price), description || "", images, parseInt(quantity) || 1, seller || null],
    });
    res.json({ success: true });
  } catch (err) {
    console.error("POST /api/products error:", err.message);
    res.status(500).json({ error: "Failed to create listing" });
  }
});

router.put("/:id", async (req, res) => {
  const { name, price, description, imageUrl, quantity } = req.body;
  try {
    const images = imageUrl ? JSON.stringify([imageUrl]) : null;
    await db.execute({
      sql: `UPDATE products SET
              name = COALESCE(?, name),
              price = COALESCE(?, price),
              description = COALESCE(?, description),
              images = COALESCE(?, images),
              quantity_remaining = COALESCE(?, quantity_remaining)
            WHERE id = ?`,
      args: [
        name || null,
        price ? parseFloat(price) : null,
        description ?? null,
        images,
        quantity ? parseInt(quantity) : null,
        req.params.id,
      ],
    });
    res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/products error:", err.message);
    res.status(500).json({ error: "Failed to update listing" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.execute({
      sql: "UPDATE products SET availability = 0 WHERE id = ?",
      args: [req.params.id],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove listing" });
  }
});

export default router;