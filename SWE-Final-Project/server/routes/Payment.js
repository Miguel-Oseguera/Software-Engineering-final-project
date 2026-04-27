import express from "express";
import db from "../db/index.js";

const router = express.Router();

// Get all saved cards for a user
router.get("/:username", async (req, res) => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM payment_methods WHERE username = ? ORDER BY is_default DESC, created_at DESC",
      args: [req.params.username],
    });
    res.json(result.rows);
  } catch (err) {
    console.error("GET cards error:", err.message);
    res.status(500).json({ error: "Failed to load cards" });
  }
});

// Add a new card
router.post("/:username", async (req, res) => {
  const { cardholder_name, last_four, expiry, card_type } = req.body;

  if (!last_four || !expiry || !cardholder_name) {
    return res.status(400).json({ error: "Missing card details" });
  }

  try {
    // Check if this is their first card — make it default
    const existing = await db.execute({
      sql: "SELECT COUNT(*) as count FROM payment_methods WHERE username = ?",
      args: [req.params.username],
    });
    const isDefault = existing.rows[0].count === 0 ? 1 : 0;

    await db.execute({
      sql: `INSERT INTO payment_methods (username, cardholder_name, last_four, expiry, card_type, is_default)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [req.params.username, cardholder_name, last_four, expiry, card_type || "Visa", isDefault],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("POST card error:", err.message);
    res.status(500).json({ error: "Failed to save card" });
  }
});

// Set a card as default
router.put("/:username/:id/default", async (req, res) => {
  try {
    await db.execute({
      sql: "UPDATE payment_methods SET is_default = 0 WHERE username = ?",
      args: [req.params.username],
    });
    await db.execute({
      sql: "UPDATE payment_methods SET is_default = 1 WHERE id = ? AND username = ?",
      args: [req.params.id, req.params.username],
    });
    res.json({ success: true });
  } catch (err) {
    console.error("PUT default card error:", err.message);
    res.status(500).json({ error: "Failed to set default card" });
  }
});

// Delete a card
router.delete("/:username/:id", async (req, res) => {
  try {
    await db.execute({
      sql: "DELETE FROM payment_methods WHERE id = ? AND username = ?",
      args: [req.params.id, req.params.username],
    });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE card error:", err.message);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

export default router;