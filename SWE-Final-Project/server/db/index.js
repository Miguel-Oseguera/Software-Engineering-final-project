import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      images TEXT DEFAULT '[]',
      availability INTEGER DEFAULT 1,
      quantity_remaining INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  try { await db.execute(`ALTER TABLE products ADD COLUMN seller TEXT`); } catch {}
  try { await db.execute(`ALTER TABLE products ADD COLUMN category TEXT`); } catch {}
  try { await db.execute(`ALTER TABLE products ADD COLUMN original_price REAL`); } catch {}
  try { await db.execute(`ALTER TABLE products ADD COLUMN updated_at TEXT`); } catch {}
  try { await db.execute(`ALTER TABLE auth_users ADD COLUMN is_admin INTEGER DEFAULT 0`); } catch {}

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      seller TEXT,
      buyer TEXT,
      price REAL,
      sold_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS discount_codes (
      code TEXT PRIMARY KEY,
      percent_off REAL NOT NULL,
      active INTEGER DEFAULT 1,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      username TEXT NOT NULL DEFAULT 'anonymous',
      stars INTEGER NOT NULL,
      comment TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      cardholder_name TEXT NOT NULL,
      last_four TEXT NOT NULL,
      expiry TEXT NOT NULL,
      card_type TEXT DEFAULT 'Visa',
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

export default db;