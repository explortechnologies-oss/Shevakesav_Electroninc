import express, { type Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { setupVite, serveStatic, log } from "./vite";
import * as http from "node:http";
import os from "os";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const pathUrl = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json.bind(res) as (body?: any) => Response;
  res.json = ((body?: any) => {
    capturedJsonResponse = body as Record<string, any> | undefined;
    return originalResJson(body);
  }) as typeof res.json;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathUrl.startsWith("/api")) {
      let logLine = `${req.method} ${pathUrl} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try { logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`; } catch {}
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// --- Local MySQL first-run helpers ---
function getUserDataDir(): string | undefined {
  // Prefer Electron-provided path when available
  if (process.env.USER_DATA_DIR && process.env.USER_DATA_DIR.trim().length > 0) {
    return process.env.USER_DATA_DIR;
  }
  // Fallback for running via `npm run dev` (no Electron)
  try {
    const home = os.homedir();
    let base: string;
    if (process.platform === "win32") {
      base = process.env.APPDATA || path.join(home, "AppData", "Roaming");
    } else if (process.platform === "darwin") {
      base = path.join(home, "Library", "Application Support");
    } else {
      base = process.env.XDG_CONFIG_HOME || path.join(home, ".config");
    }
    // Use a stable app folder name
    return path.join(base, "FixFlow");
  } catch {
    return undefined;
  }
}

function getConfigPath(): string | undefined {
  const dir = getUserDataDir();
  if (!dir) return undefined;
  return path.join(dir, "config.json");
}

function isConfigured(): boolean {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) return true;
  const cfg = getConfigPath();
  if (cfg && fs.existsSync(cfg)) {
    try {
      const json = JSON.parse(fs.readFileSync(cfg, "utf-8"));
      return typeof json.DATABASE_URL === "string" && json.DATABASE_URL.length > 0;
    } catch {
      return false;
    }
  }
  return false;
}

function readDatabaseUrlFromConfig(): string | undefined {
  try {
    const cfg = getConfigPath();
    if (!cfg) return undefined;
    if (!fs.existsSync(cfg)) return undefined;
    const json = JSON.parse(fs.readFileSync(cfg, "utf-8"));
    const url = json?.DATABASE_URL;
    return typeof url === "string" && url.length > 0 ? url : undefined;
  } catch {
    return undefined;
  }
}

function composeMysqlUrl({ host, port, user, password, database }: { host: string; port: number; user: string; password: string; database: string; }): string {
  // URL-encode user/pass
  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(password);
  return `mysql://${encUser}:${encPass}@${host}:${port}/${database}`;
}

async function testAndInitDatabase(url: string): Promise<void> {
  // Use a direct connection with multipleStatements for schema application
  const baseConfig = new URL(url);
  const host = baseConfig.hostname;
  const port = parseInt(baseConfig.port || "3306", 10);
  const user = decodeURIComponent(baseConfig.username);
  const password = decodeURIComponent(baseConfig.password);
  const database = baseConfig.pathname.replace(/^\//, "");

  // Connect to server first without database to ensure DB exists
  const serverConn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  try {
    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  } finally {
    await serverConn.end();
  }

  // Now connect to the database
  const dbConn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
  try {
    // Apply schema from packaged resource or project root
    const resourceCandidates = [
      path.join(((process as any).resourcesPath) || "", "app.asar", "database-setup.sql"),
      path.join(((process as any).resourcesPath) || "", "database-setup.sql"),
      path.join(process.cwd(), "database-setup.sql"),
    ];
    const sqlPath = resourceCandidates.find(p => !!p && fs.existsSync(p));
    if (!sqlPath) {
      // No schema file; skip if not present
      log("database-setup.sql not found; skipping schema initialization");
      return;
    }
    const raw = fs.readFileSync(sqlPath, "utf-8");
    // naive split on semicolon - handle simple statements
    const statements = raw
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));
    for (const stmt of statements) {
      await dbConn.query(stmt);
    }
  } finally {
    await dbConn.end();
  }
}

function saveConfig(url: string): void {
  const cfg = getConfigPath();
  if (!cfg) throw new Error("USER_DATA_DIR not provided by Electron; cannot persist DB config.");
  const dir = path.dirname(cfg);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(cfg, JSON.stringify({ DATABASE_URL: url }, null, 2), "utf-8");
}

// --- Setup endpoints ---
app.get("/api/setup/status", (_req: Request, res: Response) => {
  res.json({ configured: isConfigured(), userDataDir: getUserDataDir() || null });
});

app.post("/api/setup/apply", async (req: Request, res: Response) => {
  try {
    const { host, port = 3306, user, password, database } = req.body || {};
    if (!host || !user || !database) {
      return res.status(400).json({ message: "host, user, and database are required" });
    }
    const url = composeMysqlUrl({ host, port: Number(port), user, password: password || "", database });
    await testAndInitDatabase(url);
    saveConfig(url);
    // Ensure downstream migration loader can read the URL immediately
    process.env.DATABASE_URL = url;
    // After saving config and initializing, run migrations to bring DB to latest version
    const { runMigrations } = await import("./migrate");
    await runMigrations();
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("Setup apply error:", err);
    return res.status(500).json({ message: err?.message || "Setup failed" });
  }
});

// Minimal setup page when not configured
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  if (isConfigured()) {
    // Let Vite (dev) or static file handler (prod) serve the SPA index.html
    return next();
  }
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>FixFlow Setup</title>
      <style>
        body{font-family:system-ui,Arial,sans-serif;background:#0b1020;color:#e8ecf1;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
        .card{background:#121a35;border:1px solid #223061;border-radius:12px;max-width:520px;width:100%;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.4)}
        h1{margin:0 0 16px;font-size:1.25rem}
        label{display:block;font-size:.9rem;margin:10px 0 6px;color:#b7c4ff}
        input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #2b3a75;background:#0f1630;color:#e8ecf1}
        .row{display:flex;gap:10px}
        .row .col{flex:1}
        button{margin-top:16px;width:100%;padding:12px;border:0;border-radius:10px;background:#4f6cff;color:white;font-weight:600;cursor:pointer}
        button:disabled{opacity:.6;cursor:not-allowed}
        .note{font-size:.8rem;color:#9fb0ff;margin-top:10px}
        .err{color:#ff9ba3;margin-top:10px}
        .ok{color:#9dfaa7;margin-top:10px}
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Local MySQL Setup</h1>
        <div class="row">
          <div class="col">
            <label>Host</label>
            <input id="host" placeholder="127.0.0.1" value="127.0.0.1" />
          </div>
          <div class="col">
            <label>Port</label>
            <input id="port" type="number" placeholder="3306" value="3306" />
          </div>
        </div>
        <label>User</label>
        <input id="user" placeholder="root" />
        <label>Password</label>
        <input id="password" type="password" placeholder="your password" />
        <label>Database</label>
        <input id="database" placeholder="fixflow" />
        <button id="apply">Apply & Initialize</button>
        <div class="note">Tip: special characters like @ must be URL-encoded internally; this form handles it for you.</div>
        <div id="msg"></div>
      </div>
      <script>
        const el = (id) => document.getElementById(id);
        el('apply').onclick = async () => {
          const btn = el('apply');
          btn.disabled = true; el('msg').textContent='';
          const payload = {
            host: el('host').value.trim() || '127.0.0.1',
            port: parseInt(el('port').value || '3306', 10),
            user: el('user').value.trim(),
            password: el('password').value,
            database: el('database').value.trim()
          };
          try {
            const res = await fetch('/api/setup/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Setup failed');
            el('msg').textContent = 'Setup successful. Loading app...'; el('msg').className='ok';
            setTimeout(() => location.reload(), 1000);
          } catch (e) {
            el('msg').textContent = e.message;
            el('msg').className='err';
          } finally {
            btn.disabled = false;
          }
        };
      </script>
    </body>
  </html>`;
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.send(html);
});

(async () => {
  // Conditionally register app routes only when DB is configured
  let server;
  if (isConfigured()) {
    // Before loading routes, apply any pending migrations
    const { runMigrations } = await import("./migrate");
    // Ensure env var is set if coming from config file
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim().length === 0) {
      const url = readDatabaseUrlFromConfig();
      if (url) process.env.DATABASE_URL = url;
    }
    await runMigrations(process.env.DATABASE_URL);
    const { registerRoutes } = await import("./routes");
    server = await registerRoutes(app);
  } else {
    // minimal server without app routes; client should navigate to setup UI and call /api/setup/*
    server = http.createServer(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
