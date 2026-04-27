import express from "express";
import db from "../db/index.js";

const router = express.Router();

// Get all ratings for a product
router.get("/:productId", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM ratings WHERE product_id = ? ORDER BY created_at DESC`,
      args: [req.params.productId],
    });
    res.json(result.rows);
  } catch (err) {
    console.error("GET ratings error:", err.message);
    res.status(500).json({ error: "Failed to load ratings" });
  }
});

// Get average + count for a product
router.get("/:productId/summary", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT AVG(stars) as average, COUNT(*) as count FROM ratings WHERE product_id = ?`,
      args: [req.params.productId],
    });
    const row = result.rows[0];
    res.json({
      average: row.average ? Number(row.average).toFixed(1) : null,
      count: row.count || 0,
    });
  } catch (err) {
    console.error("GET ratings summary error:", err.message);
    res.status(500).json({ error: "Failed to load rating summary" });
  }
});

// Submit a rating
router.post("/:productId", async (req, res) => {
  const { stars, comment, username } = req.body;
  if (!stars || stars < 1 || stars > 5) {
    return res.status(400).json({ error: "Stars must be between 1 and 5" });
  }

  try {
    // One rating per user per product
    const existing = await db.execute({
      sql: `SELECT id FROM ratings WHERE product_id = ? AND username = ?`,
      args: [req.params.productId, username || "anonymous"],
    });

    if (existing.rows.length > 0) {
      // Update existing
      await db.execute({
        sql: `UPDATE ratings SET stars = ?, comment = ?, created_at = datetime('now') WHERE product_id = ? AND username = ?`,
        args: [Number(stars), comment || "", req.params.productId, username || "anonymous"],
      });
    } else {
      await db.execute({
        sql: `INSERT INTO ratings (product_id, username, stars, comment) VALUES (?, ?, ?, ?)`,
        args: [req.params.productId, username || "anonymous", Number(stars), comment || ""],
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("POST rating error:", err.message);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

// Delete a rating (for reset feature later)
router.delete("/:productId/:username", async (req, res) => {
  try {
    await db.execute({
      sql: `DELETE FROM ratings WHERE product_id = ? AND username = ?`,
      args: [req.params.productId, req.params.username],
    });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE rating error:", err.message);
    res.status(500).json({ error: "Failed to delete rating" });
  }
});

export default router;