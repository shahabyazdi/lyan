const handler = require("./handler");
const { ipcMain, ipcRenderer } = require("electron");

module.exports = function () {
  ipcMain.on("get-templates", handler.getTemplates);

  ipcMain.on("open", handler.open);
  ipcMain.on("save", handler.save);
  ipcMain.on("close", handler.close);

  ipcMain.on("get-settings", handler.getSettings);
  ipcMain.on("save-settings", handler.saveSettings);

  ipcMain.on("active-save", handler.activeSave);
  ipcMain.on("deactive-save", handler.deactiveSave);

  ipcMain.on("active-close", handler.activeClose);
  ipcMain.on("deactive-close", handler.deactiveClose);

  ipcMain.on("active-export", handler.activeExport);
  ipcMain.on("deactive-export", handler.deactiveExport);

  ipcMain.on("active-reports", handler.activeReports);
  ipcMain.on("deactive-reports", handler.deactiveReports);

  ipcMain.on("read-dir", handler.readDir);

  ipcMain.on("new-attachment", handler.newAttachment);
  ipcMain.on("preview-attachment", handler.previewAttachment);
  ipcMain.on("execute-attachment", handler.excecuteAttachment);
  ipcMain.on("rename-attachment", handler.renameAttachment);
  ipcMain.on("delete-attachment", handler.deleteAttachment);
  ipcMain.on("delete-attachments", handler.deleteAttachments);
  ipcMain.on("export-attachments", handler.exportAttachments);

  ipcMain.on("confirm", handler.confirm);
  ipcMain.on("alert", handler.alert);
};
