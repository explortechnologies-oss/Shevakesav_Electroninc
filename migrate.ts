import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import os from "os";

function resolveFallbackUserDataDir(): string | null {
  try {
    const home = os.homedir();
    if (process.platform === "win32") {
      const base = process.env.APPDATA || path.join(home, "AppData", "Roaming");
      return path.join(base, "FixFlow");
    } else if (process.platform === "darwin") {
      return path.join(home, "Library", "Application Support", "FixFlow");
    } else {
      const base = process.env.XDG_CONFIG_HOME || path.join(home, ".config");
      return path.join(base, "FixFlow");
    }
  } catch {
    return null;
  }
}

function loadDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
    return process.env.DATABASE_URL.trim();
  }
  const userDataDir = process.env.USER_DATA_DIR;
  if (userDataDir) {
    const cfgPath = path.join(userDataDir, "config.json");
    if (fs.existsSync(cfgPath)) {
      const json = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
      if (json && typeof json.DATABASE_URL === "string" && json.DATABASE_URL.length > 0) {
        return json.DATABASE_URL;
      }
    }
  }
  // Fallback for dev runs when USER_DATA_DIR isn't set but index.ts saved config in OS appdata
  const fallback = resolveFallbackUserDataDir();
  if (fallback) {
    const cfgPath = path.join(fallback, "config.json");
    if (fs.existsSync(cfgPath)) {
      const json = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
      if (json && typeof json.DATABASE_URL === "string" && json.DATABASE_URL.length > 0) {
        return json.DATABASE_URL;
      }
    }
  }
  throw new Error("No DATABASE_URL found for migrations");
}

function findMigrationsDir(): string | null {
  const candidates = [
    path.join(((process as any).resourcesPath) || "", "migrations"),
    path.join(process.cwd(), "migrations"),
  ];
  for (const dir of candidates) {
    if (dir && fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
  }
  return null;
}

function listMigrationFiles(dir: string): string[] {
  const files = fs.readdirSync(dir)
    .filter(f => f.toLowerCase().endsWith(".sql"))
    .sort(); // lexicographic order by name like 0001_*.sql
  return files.map(f => path.join(dir, f));
}

function normalizeMigrationSql(sql: string): string {
  // Remove unsupported IF NOT EXISTS tokens for MySQL 5.7/MariaDB
  return sql
    .replace(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/gi, 'ADD COLUMN')
    .replace(/ADD\s+UNIQUE\s+KEY\s+IF\s+NOT\s+EXISTS/gi, 'ADD UNIQUE KEY')
    .replace(/ADD\s+INDEX\s+IF\s+NOT\s+EXISTS/gi, 'ADD INDEX');
}

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;[\r\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
}

function isIgnorableMigrationError(err: any): boolean {
  const errno = err?.errno || err?.code;
  const msg = String(err?.message || '').toLowerCase();
  // Duplicate column/index/constraint errors we can ignore when re-running
  if (errno === 1060 /* ER_DUP_FIELDNAME */) return true;
  if (errno === 1061 /* ER_DUP_KEYNAME */) return true;
  if (errno === 1826 /* ER_DUP_FOREIGN_KEY */) return true;
  if (errno === 1072 /* ER_KEY_COLUMN_DOES_NOT_EXITS */) return true; // FK references a column missing in this schema variant; skip
  if (msg.includes('duplicate') || msg.includes('already exists')) return true;
  if (msg.includes("doesn't exist in table") && msg.includes('key column')) return true;
  return false;
}

export async function runMigrations(urlOverride?: string): Promise<void> {
  const url = (urlOverride && urlOverride.trim().length > 0) ? urlOverride : loadDatabaseUrl();
  const dir = findMigrationsDir();
  if (!dir) {
    // No migrations bundled; nothing to do
    return;
  }
  const files = listMigrationFiles(dir);
  if (files.length === 0) return;

  // Connect to DB (database must exist at this point)
  const dbUrl = new URL(url);
  const conn = await mysql.createConnection({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || "3306", 10),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ""),
    multipleStatements: true,
  });

  try {
    // Create applied table
    await conn.query(`CREATE TABLE IF NOT EXISTS migrations_applied (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    // Optional lock to prevent concurrent runs (best-effort)
    await conn.query(`SELECT GET_LOCK('fixflow_migrations_lock', 30)`);

    // Fetch applied
    const [rows] = await conn.query<RowDataPacket[]>(`SELECT name FROM migrations_applied`);
    const applied = new Set((rows as RowDataPacket[]).map((r) => (r as any).name as string));

    for (const file of files) {
      const name = path.basename(file);
      if (applied.has(name)) continue;
      const raw = fs.readFileSync(file, "utf-8");
      const normalized = normalizeMigrationSql(raw);
      const statements = splitSqlStatements(normalized);

      for (const stmt of statements) {
        try {
          await conn.query(stmt);
        } catch (e: any) {
          if (isIgnorableMigrationError(e)) {
            // Ignore and continue
            continue;
          }
          // Re-throw otherwise
          throw e;
        }
      }

      await conn.query(`INSERT INTO migrations_applied (name) VALUES (?)`, [name]);
    }

    // Release lock
    await conn.query(`SELECT RELEASE_LOCK('fixflow_migrations_lock')`);
  } finally {
    await conn.end();
  }
}
