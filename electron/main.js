// @ts-check
/**
 * Electron main process for KindWorks Usage Dashboard.
 *
 * Boots the Next.js standalone server in-process on a local port,
 * then opens a single BrowserWindow pointing at it. On quit, the
 * server is cleanly terminated.
 */

const { app, BrowserWindow, shell, Menu, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");
const net = require("net");

const isDev = !app.isPackaged;

/** @type {import("child_process").ChildProcess | null} */
let serverProcess = null;
/** @type {BrowserWindow | null} */
let mainWindow = null;
/** Rolling tail of Next.js server output, surfaced in the error dialog. */
/** @type {string[]} */
const serverLog = [];

/** Inline splash shown while the Next.js server boots. Uses brand tokens so
 *  the first paint matches the dashboard. Rendered via data: URL so no extra
 *  files need to ship. */
const SPLASH_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><title>KindWorks Usage</title>
<style>
  html, body { margin: 0; height: 100%; background: #1b4239; color: #fafaf7;
    font-family: -apple-system, "DM Sans", system-ui, sans-serif;
    -webkit-app-region: drag; user-select: none; }
  .wrap { display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%; gap: 24px; }
  .mark { width: 96px; height: 96px; border-radius: 24px;
    background: #2e6661;
    background-image: linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
    background-size: 16px 16px;
    display: grid; place-items: center; position: relative;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
  .mark::after { content: ""; position: absolute; top: 14px; right: 14px;
    width: 14px; height: 14px; border-radius: 9999px; background: #ffb500; }
  .k { font-weight: 800; font-size: 52px; color: #fafaf7; line-height: 1; }
  .title { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
  .sub { font-size: 14px; color: rgba(250,250,247,0.65); }
  .dots span { display: inline-block; width: 8px; height: 8px; margin: 0 3px;
    border-radius: 9999px; background: #ffb500; opacity: 0.3;
    animation: pulse 1.2s infinite ease-in-out; }
  .dots span:nth-child(2) { animation-delay: 0.2s; }
  .dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
</style></head>
<body><div class="wrap">
  <div class="mark"><div class="k">K</div></div>
  <div class="title">KindWorks Usage</div>
  <div class="sub">Starting up…</div>
  <div class="dots"><span></span><span></span><span></span></div>
</div></body></html>`;

const SPLASH_URL = "data:text/html;charset=utf-8," + encodeURIComponent(SPLASH_HTML);

/** Find a free TCP port starting from `from`. */
function findFreePort(from = 3725) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", () => {
      findFreePort(from + 1).then(resolve, reject);
    });
    srv.listen(from, "127.0.0.1", () => {
      const addr = srv.address();
      const port = typeof addr === "object" && addr ? addr.port : from;
      srv.close(() => resolve(port));
    });
  });
}

/** Resolve the absolute path to the packaged Next.js standalone server. */
function resolveServerPath() {
  if (isDev) {
    // In dev, run the built standalone server from the repo (after `npm run build`).
    return path.join(__dirname, "..", ".next", "standalone", "server.js");
  }
  // In production, electron-builder copies the standalone bundle under resources/app-dist.
  return path.join(process.resourcesPath, "app-dist", "server.js");
}

/** Start the Next.js standalone server as a child process. */
function startServer(port) {
  return new Promise((resolve, reject) => {
    const serverPath = resolveServerPath();
    const serverDir = path.dirname(serverPath);

    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server bundle missing at ${serverPath}`));
      return;
    }

    const record = (prefix, chunk) => {
      const text = `[${prefix}] ${chunk}`;
      serverLog.push(text);
      if (serverLog.length > 200) serverLog.shift();
      process.stdout.write(text);
    };

    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: serverDir,
      env: {
        ...process.env,
        // Tell Electron's node to run as plain node, not as Electron:
        ELECTRON_RUN_AS_NODE: "1",
        PORT: String(port),
        HOSTNAME: "127.0.0.1",
        NODE_ENV: "production",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    serverProcess.stdout?.on("data", (chunk) => record("next", chunk));
    serverProcess.stderr?.on("data", (chunk) => record("next:err", chunk));
    serverProcess.on("exit", (code) => {
      record("next", `exited with code ${code}\n`);
    });
    serverProcess.on("error", (err) => {
      record("next", `spawn error: ${err.message}\n`);
      reject(err);
    });

    // Poll until the server responds.
    const deadline = Date.now() + 20_000;
    const check = () => {
      const req = http.get(
        { host: "127.0.0.1", port, path: "/", timeout: 1000 },
        (res) => {
          res.resume();
          resolve(undefined);
        }
      );
      req.on("error", () => {
        if (Date.now() > deadline) {
          reject(new Error("Next.js server did not start within 20s"));
          return;
        }
        setTimeout(check, 250);
      });
    };
    setTimeout(check, 400);
  });
}

function createMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Refresh",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow?.reload(),
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "Alt+CmdOrCtrl+I",
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      role: "window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ];
  // @ts-expect-error — Electron template types are loose
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showStartupError(err) {
  const tail = serverLog.slice(-40).join("") || "(no server output captured)";
  const message = `KindWorks Usage failed to start.\n\n${err?.message ?? err}`;
  const detail = `Server log (tail):\n${tail}`;
  // showErrorBox is synchronous and works before any window exists; keep the
  // dashboard window (with splash) visible behind it so the user can see
  // something is happening and close the app normally.
  dialog.showErrorBox(message, detail);
}

async function createWindow() {
  // Open the window immediately with a splash screen so the user sees
  // feedback while the Next.js server boots (previously this could take
  // several seconds and the app looked frozen with no window at all).
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#1b4239",
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(SPLASH_URL);

  // Open external links (docs, console) in the user's default browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (e, url) => {
    if (
      !url.startsWith("http://127.0.0.1:") &&
      !url.startsWith("http://localhost:") &&
      !url.startsWith("data:")
    ) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  // In `electron:dev`, a Next.js dev server is already running —
  // point the window at it instead of spawning our own.
  const devUrl = process.env.NEXT_DEV_URL;
  let targetUrl;
  if (devUrl) {
    targetUrl = devUrl;
  } else {
    try {
      const port = await findFreePort(3725);
      await startServer(port);
      targetUrl = `http://127.0.0.1:${port}/`;
    } catch (e) {
      console.error("Failed to start Next.js server:", e);
      showStartupError(e);
      return;
    }
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL(targetUrl);
  }
}

function killServer() {
  if (serverProcess && !serverProcess.killed) {
    try {
      serverProcess.kill();
    } catch {
      /* ignore */
    }
    serverProcess = null;
  }
}

app.whenReady().then(() => {
  createMenu();
  createWindow();
});

app.on("window-all-closed", () => {
  killServer();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", killServer);
app.on("will-quit", killServer);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
