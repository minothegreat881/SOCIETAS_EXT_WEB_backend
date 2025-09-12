const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const db = new Database("data/scear.db");

// Create admin_users table
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT UNIQUE NOT NULL,
    firstname TEXT,
    lastname TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    blocked INTEGER DEFAULT 0,
    prefered_language TEXT DEFAULT "en",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    locale TEXT DEFAULT "en"
  );
`);

// Create fresh admin
const email = "admin@scear.sk";
const password = "FreshScear2025!";
const hashedPassword = bcrypt.hashSync(password, 10);
const now = new Date().toISOString();
const documentId = "fresh-admin-" + Date.now();

const stmt = db.prepare(`
  INSERT INTO admin_users (
    document_id, firstname, lastname, email, password,
    is_active, blocked, prefered_language,
    created_at, updated_at, published_at, locale
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

stmt.run(documentId, "Fresh", "Admin", email, hashedPassword, 1, 0, "en", now, now, now, "en");

console.log("✅ Fresh admin created:");
console.log("Email:", email);
console.log("Password:", password);
db.close();
