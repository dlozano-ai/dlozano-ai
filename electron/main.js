// @ts-check
/**
 * Electron main process for KindWorks Usage Dashboard.
 *
 * Boots the Next.js standalone server in-process on a local port,
 * then opens a single BrowserWindow pointing at it. On quit, the
 * server is cleanly terminated.
 */

const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const net = require("net");

const isDev = !app.isPackaged;

/** @type {import("child_process").ChildProcess | null} */
let serverProcess = null;
/** @type {BrowserWindow | null} */
let mainWindow = null;

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

    serverProcess.stdout?.on("data", (chunk) => {
      process.stdout.write(`[next] ${chunk}`);
    });
    serverProcess.stderr?.on("data", (chunk) => {
      process.stderr.write(`[next] ${chunk}`);
    });
    serverProcess.on("exit", (code) => {
      console.log(`[next] exited with code ${code}`);
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

async function createWindow() {
  // In `electron:dev`, a Next.js dev server is already running —
  // point the window at it instead of spawning our own.
  const devUrl = process.env.NEXT_DEV_URL;
  let targetUrl;
  if (devUrl) {
    targetUrl = devUrl;
  } else {
    const port = await findFreePort(3725);
    try {
      await startServer(port);
    } catch (e) {
      console.error("Failed to start Next.js server:", e);
      app.quit();
      return;
    }
    targetUrl = `http://127.0.0.1:${port}/`;
  }

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#fafaf7",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());

  // Open external links (docs, console) in the user's default browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("http://127.0.0.1:") && !url.startsWith("http://localhost:")) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.loadURL(targetUrl);
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
