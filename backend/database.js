import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'meditrack.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // OTP codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      report_date DATE,
      source TEXT,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
  `);

  console.log('✅ Database initialized successfully');
}

// User operations
export const userDb = {
  findByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },
  
  create: (email) => {
    const result = db.prepare('INSERT INTO users (email, verified) VALUES (?, 1)').run(email);
    return result.lastInsertRowid;
  },
  
  findById: (id) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
};

// OTP operations
export const otpDb = {
  create: (email, code, expiresAt) => {
    // Delete old OTPs for this email
    db.prepare('DELETE FROM otp_codes WHERE email = ?').run(email);
    // Insert new OTP
    return db.prepare('INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)').run(email, code, expiresAt);
  },
  
  verify: (email, code) => {
    const otp = db.prepare('SELECT * FROM otp_codes WHERE email = ? AND code = ? AND expires_at > datetime("now")').get(email, code);
    if (otp) {
      // Delete used OTP
      db.prepare('DELETE FROM otp_codes WHERE id = ?').run(otp.id);
      return true;
    }
    return false;
  },
  
  cleanup: () => {
    // Delete expired OTPs
    db.prepare('DELETE FROM otp_codes WHERE expires_at < datetime("now")').run();
  }
};

// Report operations
export const reportDb = {
  create: (userId, title, category, reportDate, source, filePath, fileType) => {
    const result = db.prepare(`
      INSERT INTO reports (user_id, title, category, report_date, source, file_path, file_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, title, category, reportDate, source, filePath, fileType);
    return result.lastInsertRowid;
  },
  
  findByUserId: (userId, search = '', category = '', sortBy = 'created_at', order = 'DESC') => {
    let query = 'SELECT * FROM reports WHERE user_id = ?';
    const params = [userId];
    
    if (search) {
      query += ' AND (title LIKE ? OR source LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ` ORDER BY ${sortBy} ${order}`;
    
    return db.prepare(query).all(...params);
  },
  
  findById: (id, userId) => {
    return db.prepare('SELECT * FROM reports WHERE id = ? AND user_id = ?').get(id, userId);
  },
  
  delete: (id, userId) => {
    const result = db.prepare('DELETE FROM reports WHERE id = ? AND user_id = ?').run(id, userId);
    return result.changes > 0;
  },
  
  getCategories: (userId) => {
    return db.prepare('SELECT DISTINCT category FROM reports WHERE user_id = ? AND category IS NOT NULL ORDER BY category').all(userId);
  }
};

// Initialize database on import
initDatabase();

// Cleanup expired OTPs every hour
setInterval(() => {
  otpDb.cleanup();
}, 60 * 60 * 1000);

export default db;
