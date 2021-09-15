const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const Menu = require("./electron/menu");
const handleEvents = require("./electron/handle_events");
const Settings = require("./electron/settings");
const getMode = require("./electron/shared/getMode");

let mainWindow;

function createWindow() {
  const {
    mainWindow: { width, height },
  } = Settings.get();

  mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      nativeWindowOpen: true,
      contextIsolation: true,
      preload: path.join(__dirname, "/electron/preload/index.js"),
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.on("closed", () => (mainWindow = null));

  mainWindow.on("resize", handleResize);

  mainWindow.on("close", handleExit);

  Menu.init();

  handleEvents();
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function handleResize() {
  const { width, height } = mainWindow.getBounds();

  Settings.update("mainWindow", { width, height });
}

async function handleExit(e) {
  e.preventDefault();

  let state = await new Promise((resolve) => {
    mainWindow.webContents.send("exit-request");

    ipcMain.on("exit-response", (event, strState) =>
      resolve(JSON.parse(strState))
    );
  });

  if (state.save) {
    const checkRequiredElements = require("./electron/shared/checkRequiredElements");
    const { valid, message } = checkRequiredElements(state);
    const { confirm, alert } = require("./electron/handle_events/handler");

    if (!valid) return alert(undefined, message);

    let response = await confirm(
      undefined,
      `${getMode(state.mode)} not saved, Close anyway?`
    );

    if (!response) return;
  }

  mainWindow.destroy();
}
