import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";
import fs from "fs";
import path from "path";

function loadDatabaseUrl(): string {
  // Priority 1: explicit env var
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
    return process.env.DATABASE_URL.trim();
  }

  // Priority 2: user-scoped persisted config written by the app on first run
  const userDataDir = process.env.USER_DATA_DIR;
  if (userDataDir) {
    try {
      const cfgPath = path.join(userDataDir, "config.json");
      if (fs.existsSync(cfgPath)) {
        const json = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
        if (json && typeof json.DATABASE_URL === "string" && json.DATABASE_URL.length > 0) {
          return json.DATABASE_URL;
        }
      }
    } catch (err) {
      // non-fatal: fall through
      console.warn("Failed to read DB config from USER_DATA_DIR:", err);
    }
  }

  throw new Error("DATABASE_URL must be set. Provide it via environment or user config.\n" +
    "Tip: For local MySQL, set DATABASE_URL in config.json at Electron userData (passed as USER_DATA_DIR).\n" +
    "Format: mysql://USER:PASSWORD@HOST:3306/DBNAME (URL-encode special characters like @ as %40)");
}

const DATABASE_URL = loadDatabaseUrl();
const pool = mysql.createPool(DATABASE_URL);

export const db = drizzle(pool, { schema, mode: "default" });
export { pool };