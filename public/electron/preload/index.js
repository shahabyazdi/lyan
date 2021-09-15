const { contextBridge, ipcRenderer } = require("electron");
const checkRequiredElements = require("../shared/checkRequiredElements");

contextBridge.exposeInMainWorld("api", {
  registerStore,
  getTemplates,
  getSettings,
  saveSettings,
  activeSave,
  activeClose,
  activeReports,
  readDir,
  newAttachment,
  previewAttachment,
  excecuteAttachment,
  renameAttachment,
  deleteAttachment,
  alert,
  confirm,
  checkRequiredElements,
  open,
});

function registerStore(store) {
  const Helper = require("./helper");
  const helper = new Helper(store);

  ipcRenderer.on("open-file", helper.openFile);

  ipcRenderer.on("save", helper.save);
  ipcRenderer.on("close", helper.close);
  ipcRenderer.on("settings", helper.openSettings);

  ipcRenderer.on("open-request", helper.handleOpen);
  ipcRenderer.on("export-request", helper.handleExport);
  ipcRenderer.on("close-request", helper.handleClose);
  ipcRenderer.on("exit-request", helper.handleExit);
  ipcRenderer.on("delete-attachments-request", helper.handleDeleteAttachment);

  ipcRenderer.on("reset-sub-path", helper.resetSubPath);

  ipcRenderer.on("set-view:default", () => helper.toggleView("default"));
  ipcRenderer.on("set-view:reports", () => helper.toggleView("reports"));
}

function getTemplates() {
  return JSON.parse(ipcRenderer.sendSync("get-templates"));
}

function getSettings() {
  return JSON.parse(ipcRenderer.sendSync("get-settings"));
}

function saveSettings(settings) {
  ipcRenderer.send("save-settings", JSON.stringify(settings));
}

function activeSave() {
  ipcRenderer.send("active-save");
}

function activeClose(id) {
  ipcRenderer.send("active-close", id);
}

function activeReports() {
  ipcRenderer.send("active-reports");
}

function readDir(dir) {
  return ipcRenderer.sendSync("read-dir", dir);
}

function newAttachment(params) {
  return ipcRenderer.sendSync("new-attachment", JSON.stringify(params));
}

function previewAttachment(dir) {
  return ipcRenderer.sendSync("preview-attachment", dir);
}

function excecuteAttachment(dir) {
  ipcRenderer.send("execute-attachment", dir);
}

function renameAttachment(dir, oldName, newName) {
  ipcRenderer.sendSync("rename-attachment", dir, oldName, newName);
}

function deleteAttachment(dir, id) {
  ipcRenderer.sendSync("delete-attachment", dir, id);
}

function alert(message) {
  ipcRenderer.send("alert", message);
}

function confirm(message) {
  return ipcRenderer.sendSync("confirm", message);
}

function open(path) {
  ipcRenderer.send("open", path);
}
