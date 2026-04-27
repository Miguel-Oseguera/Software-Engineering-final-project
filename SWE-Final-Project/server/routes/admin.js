import express from "express";
import db from "../db/index.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const products = await db.execute("SELECT COUNT(*) AS count FROM products");
    const users = await db.execute("SELECT COUNT(*) AS count FROM auth_users");
    const orders = await db.execute("SELECT COUNT(*) AS count FROM sales");
    const revenue = await db.execute("SELECT COALESCE(SUM(price), 0) AS total FROM sales");

    res.json({
      products: products.rows[0]?.count || 0,
      users: users.rows[0]?.count || 0,
      orders: orders.rows[0]?.count || 0,
      revenue: revenue.rows[0]?.total || 0,
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err.message);
    res.status(500).json({ error: "Failed to load admin stats" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT * FROM products
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN PRODUCTS ERROR:", err.message);
    res.status(500).json({ error: "Failed to load products" });
  }
});

router.post("/products", async (req, res) => {
  const { name, price, description, imageUrl, quantity, seller, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  try {
    const id = Date.now();
    const images = imageUrl ? JSON.stringify([imageUrl]) : "[]";

    await db.execute({
      sql: `
        INSERT INTO products
        (id, name, price, description, images, availability, quantity_remaining, seller, category)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
      `,
      args: [
        id,
        name,
        Number(price),
        description || "",
        images,
        Number(quantity) || 1,
        seller || "fakeamazon",
        category || null,
      ],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN CREATE PRODUCT ERROR:", err.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/products/:id", async (req, res) => {
  const { name, price, description, imageUrl, quantity, quantity_remaining, availability, seller, category } = req.body;

  try {
    const images = imageUrl ? JSON.stringify([imageUrl]) : null;

    await db.execute({
      sql: `
        UPDATE products SET
          name = COALESCE(?, name),
          price = COALESCE(?, price),
          description = COALESCE(?, description),
          images = COALESCE(?, images),
          quantity_remaining = COALESCE(?, quantity_remaining),
          availability = COALESCE(?, availability),
          seller = COALESCE(?, seller),
          category = COALESCE(?, category),
          updated_at = datetime('now')
        WHERE id = ?
      `,
      args: [
        name || null,
        price !== undefined && price !== "" ? Number(price) : null,
        description ?? null,
        images,
        quantity_remaining !== undefined && quantity_remaining !== ""
          ? Number(quantity_remaining)
          : quantity !== undefined && quantity !== ""
          ? Number(quantity)
          : null,
        availability !== undefined && availability !== "" ? Number(availability) : null,
        seller || null,
        category || null,
        req.params.id,
      ],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN UPDATE PRODUCT ERROR:", err.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await db.execute({
      sql: "UPDATE products SET availability = 0, updated_at = datetime('now') WHERE id = ?",
      args: [req.params.id],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN DELETE PRODUCT ERROR:", err.message);
    res.status(500).json({ error: "Failed to remove product" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT id, username, email, is_admin
      FROM auth_users
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err.message);
    res.status(500).json({ error: "Failed to load users" });
  }
});

router.put("/users/:id", async (req, res) => {
  const { username, email, password, is_admin } = req.body;

  try {
    await db.execute({
      sql: `
        UPDATE auth_users SET
          username = COALESCE(?, username),
          email = COALESCE(?, email),
          password = COALESCE(?, password),
          is_admin = COALESCE(?, is_admin)
        WHERE id = ?
      `,
      args: [
        username || null,
        email || null,
        password || null,
        is_admin !== undefined ? Number(is_admin) : null,
        req.params.id,
      ],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN UPDATE USER ERROR:", err.message);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await db.execute({
      sql: "DELETE FROM auth_users WHERE id = ?",
      args: [req.params.id],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN DELETE USER ERROR:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.get("/discounts", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT * FROM discount_codes
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN DISCOUNTS ERROR:", err.message);
    res.status(500).json({ error: "Failed to load discount codes" });
  }
});

router.post("/discounts", async (req, res) => {
  const { code, percentOff, expiresAt } = req.body;

  if (!code || percentOff === undefined || percentOff === "") {
    return res.status(400).json({ error: "Code and percent off are required" });
  }

  try {
    await db.execute({
      sql: `
        INSERT INTO discount_codes (code, percent_off, active, expires_at)
        VALUES (?, ?, 1, ?)
      `,
      args: [code.toUpperCase(), Number(percentOff), expiresAt || null],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN CREATE DISCOUNT ERROR:", err.message);
    res.status(500).json({ error: "Failed to create discount code" });
  }
});

router.put("/discounts/:code", async (req, res) => {
  const { active } = req.body;

  try {
    await db.execute({
      sql: "UPDATE discount_codes SET active = ? WHERE code = ?",
      args: [Number(active), req.params.code],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN UPDATE DISCOUNT ERROR:", err.message);
    res.status(500).json({ error: "Failed to update discount code" });
  }
});

router.get("/bundle-deals", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT *
      FROM bundle_deals
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN GET BUNDLE DEALS ERROR:", err.message);
    res.status(500).json({ error: "Failed to load bundle deals" });
  }
});

router.post("/bundle-deals", async (req, res) => {
  const { name, productIds, percentOff } = req.body;

  if (!name || !productIds || productIds.length < 2 || percentOff === "") {
    return res.status(400).json({
      error: "Name, at least 2 products, and percent off are required",
    });
  }

  try {
    await db.execute({
      sql: `
        INSERT INTO bundle_deals (name, product_ids, percent_off, active)
        VALUES (?, ?, ?, 1)
      `,
      args: [name, JSON.stringify(productIds), Number(percentOff)],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN CREATE BUNDLE DEAL ERROR:", err.message);
    res.status(500).json({ error: "Failed to create bundle deal" });
  }
});

router.put("/bundle-deals/:id", async (req, res) => {
  const { active } = req.body;

  try {
    await db.execute({
      sql: "UPDATE bundle_deals SET active = ? WHERE id = ?",
      args: [Number(active), req.params.id],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN UPDATE BUNDLE DEAL ERROR:", err.message);
    res.status(500).json({ error: "Failed to update bundle deal" });
  }
});

router.delete("/bundle-deals/:id", async (req, res) => {
  try {
    await db.execute({
      sql: "DELETE FROM bundle_deals WHERE id = ?",
      args: [req.params.id],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("ADMIN DELETE BUNDLE DEAL ERROR:", err.message);
    res.status(500).json({ error: "Failed to delete bundle deal" });
  }
});

router.get("/orders/history", async (req, res) => {
  const { sort } = req.query;

  let orderBy = "sold_at DESC";

  if (sort === "customer") orderBy = "buyer ASC";
  if (sort === "dollars") orderBy = "price DESC";
  if (sort === "date") orderBy = "sold_at DESC";

  try {
    const result = await db.execute(`
      SELECT *
      FROM sales
      ORDER BY ${orderBy}
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN ORDERS ERROR:", err.message);
    res.status(500).json({ error: "Failed to load orders" });
  }
});

router.get("/orders/current", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT *
      FROM sales
      ORDER BY sold_at DESC
      LIMIT 25
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ADMIN CURRENT ORDERS ERROR:", err.message);
    res.status(500).json({ error: "Failed to load current orders" });
  }
});

export default router;