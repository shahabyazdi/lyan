const { Menu } = require("electron");
const isDev = require("electron-is-dev");

let menu;
let viewMessage = "set-view:default";

module.exports = {
  init,
  get,
  resetViewMessage,
};

function init() {
  menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open",
          accelerator: "Ctrl+o",
          id: "open",
          enabled: true,
          click: (...args) => sendMessage("open-request", args),
        },
        {
          label: "Save",
          accelerator: "Ctrl+s",
          id: "save",
          enabled: false,
          click: (...args) => sendMessage("save", args),
        },
        {
          label: "Close",
          id: "close",
          enabled: false,
          click: (...args) => sendMessage("close-request", args),
        },
        {
          id: "settings",
          label: "Settings",
          click: (...args) => sendMessage("settings", args),
        },
        { role: "quit" },
      ],
    },
    {
      label: "Attachments",
      submenu: [
        {
          id: "import",
          label: "Import",
          accelerator: "Ctrl+i",
          enabled: true,
          click: () => getHandler().importAttachments(),
        },
        {
          id: "export",
          label: "Export",
          accelerator: "Ctrl+e",
          enabled: false,
          click: (...args) => sendMessage("export-request", args),
        },
        {
          id: "delete",
          label: "Delete",
          enabled: false,
          click: (...args) => sendMessage("delete-attachments-request", args),
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Default",
          id: "default",
          type: "radio",
          checked: true,
          click: (...args) => sendMessage("set-view:default", args),
        },
        {
          label: "Reports",
          id: "reports",
          type: "radio",
          enabled: false,
          click: (...args) => sendMessage("set-view:reports", args),
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Console",
          visible: isDev,
          click: (menuItem, browserWindow) => browserWindow.openDevTools(),
        },
        {
          label: "About",
          click: () => getHandler().about(),
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  return menu;
}

function get() {
  return menu;
}

function sendMessage(message, [menuItem, browserWindow]) {
  if (["set-view:default", "set-view:reports"].includes(message)) {
    if (viewMessage === message) return;

    viewMessage = message;
  }

  browserWindow.send(message);
}

function getHandler() {
  return require("../handle_events/handler");
}

function resetViewMessage() {
  viewMessage = "set-view:default";
}
