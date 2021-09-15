const fs = require("fs");
const path = require("path");
const Settings = require("../settings");
const Menu = require("../menu");
const { dialog, shell, app, BrowserWindow, Notification } = require("electron");
const getMode = require("../shared/getMode");

module.exports = {
  getTemplates: (event) => {
    let templates = "";

    try {
      templates = fs.readFileSync(
        path.join(__dirname, "../templates/templates.json"),
        "utf-8"
      );
    } catch (err) {
      console.log(err);
    }

    event.returnValue = templates;
  },
  open: (event, dir) => {
    if (dir) return handleOpen(dir);

    dialog
      .showOpenDialog(BrowserWindow.getFocusedWindow(), {
        filters: [{ name: "LMS File", extensions: ["lmsf"] }],
        title: "Open",
      })
      .then(({ canceled, filePaths }) => {
        if (canceled) return;

        handleOpen(filePaths[0]);
      });

    function handleOpen(dir) {
      let file,
        name,
        { recentFiles = [] } = Settings.get();

      recentFiles = recentFiles.filter((item) => dir !== item.dir);

      try {
        file = fs.readFileSync(dir, "utf-8");
        name = dir.split?.(/\\|\//)?.pop?.();

        if (dir && file) {
          recentFiles.unshift({ name, dir });

          if (recentFiles.length > 10) recentFiles.length = 10;
        }
      } catch (err) {
        console.log(err);
      }

      Settings.update("recentFiles", recentFiles);

      BrowserWindow.getFocusedWindow().webContents.send(
        "open-file",
        file,
        dir,
        name
      );
    }
  },
  save: (event, data, dir, mode) => {
    if (mode === "template") {
      let templates = "";
      let dir = path.join(__dirname, "../templates/templates.json");

      try {
        templates = fs.readFileSync(dir, "utf-8");
        templates = JSON.parse(templates);
        templates.push(JSON.parse(data));
        templates = JSON.stringify(templates, undefined, 2);

        fs.writeFileSync(dir, templates);
      } catch (err) {
        console.log(err);
      }

      event.returnValue = templates;
    } else if (mode === "edit") {
      let dir = path.join(__dirname, "../templates/templates.json");

      try {
        fs.writeFileSync(dir, data);
      } catch (err) {
        console.log(err);
      }

      event.returnValue = true;
    } else if (["file", "reports"].includes(mode)) {
      if (!dir) {
        dir = dialog.showSaveDialogSync(BrowserWindow.getFocusedWindow(), {
          filters: [{ name: "LMS File", extensions: ["lmsf"] }],
          title: "Save",
        });
      }

      try {
        if (!dir) event.returnValue = "";
        if (!/\.lmsf$/.test(dir)) dir = dir + ".lmsf";

        fs.writeFileSync(dir, data);

        event.returnValue = dir;
      } catch (e) {
        console.log(e);

        event.returnValue = undefined;
      }
    }
  },
  close: async (event, strState) => {
    let state = JSON.parse(strState);

    if (state.save) {
      const checkRequiredElements = require("../shared/checkRequiredElements");
      const { valid, message } = checkRequiredElements(state);

      if (!valid) return alert(undefined, message);

      let response = await confirm(
        undefined,
        `${getMode(state.mode)} not saved, Close anyway?`
      );

      if (!response) return;
    }

    BrowserWindow.getFocusedWindow().send("close");
  },
  getSettings: (event) => {
    event.returnValue = JSON.stringify(Settings.get());
  },
  saveSettings: (event, settings) => {
    Settings.set(JSON.parse(settings));
  },
  activeSave: () => {
    let menu = Menu.get();
    let save = menu.getMenuItemById("save");

    save.enabled = true;
  },
  deactiveSave: () => {
    let menu = Menu.get();
    let save = menu.getMenuItemById("save");

    save.enabled = false;
  },
  activeClose: (event, id) => {
    let menu = Menu.get();
    let close = menu.getMenuItemById("close");

    close.enabled = true;

    activeExport(undefined, id);
  },
  deactiveClose: () => {
    let menu = Menu.get();
    let close = menu.getMenuItemById("close");

    close.enabled = false;

    deactiveExport();
  },
  activeExport,
  deactiveExport,
  activeReports,
  deactiveReports,
  readDir: (event, dir) => {
    event.returnValue = getDir(dir);
  },
  newAttachment: (event, params) => {
    try {
      let { file, item, subPath, type, files, folder } = JSON.parse(params);
      let dir = path.join(
        app.getPath("userData"),
        "attachments",
        file.id,
        item.id,
        ...subPath
      );

      if (type === "folder") {
        newDir(path.join(dir, folder.name));
      } else if (type === "file") {
        newDir(dir);

        files.forEach((file) => {
          fs.copyFileSync(file.path, path.join(dir, file.name));
        });
      }

      activeExport(undefined, file.id);

      event.returnValue = true;
    } catch (err) {
      console.log(err);

      event.returnValue = false;
    }
  },
  previewAttachment: async (event, dir) => {
    try {
      dir = getAttachmentDir(dir);

      const sharp = require("sharp");
      const file = await sharp(dir).resize(100, 120).jpeg().toBuffer();
      const base64 = file.toString("base64");

      event.returnValue = base64;
    } catch (err) {
      console.log("preview err", err);
      event.returnValue = "";
    }
  },
  excecuteAttachment: (event, dir) => {
    shell.openPath(getAttachmentDir(dir));
  },
  renameAttachment: async (event, dir, oldName, newName) => {
    dir = getAttachmentDir(dir);

    if (fs.existsSync(dir)) {
      fs.renameSync(path.join(dir, oldName), path.join(dir, newName));
    }

    event.returnValue = true;
  },
  deleteAttachment: async (event, dir, id) => {
    dir = getAttachmentDir(dir);

    if (isDir(dir)) {
      //folder
      removeDir(dir);
    } else {
      //file
      fs.unlinkSync(dir);
    }

    // removeParentFolderRecursive(dir);
    deactiveExport(undefined, id);

    event.returnValue = true;

    // function removeParentFolderRecursive(dir) {
    //   //removing parent folder if is empty
    //   try {
    //     let parentFolder = dir.replace(/[^\/]*$/, "").replace(/\/$/, "");
    //     let { files, folders } = getDir(parentFolder);

    //     if (files.length === 0 && folders.length === 0) {
    //       removeDir(parentFolder);
    //       removeParentFolderRecursive(parentFolder);
    //     }
    //   } catch {}
    // }
  },
  deleteAttachments: (event, id) => {
    removeDir(getAttachmentDir(id));
    deactiveExport(undefined, id);

    event.returnValue = true;
  },
  exportAttachments: (event, id) => {
    if (!id || typeof id !== "string") return;

    let fileDir = dialog.showSaveDialogSync(BrowserWindow.getFocusedWindow(), {
      filters: [{ name: "Zip File", extensions: ["zip"] }],
      title: "Export",
    });

    if (!fileDir) return;
    if (!fileDir.endsWith(".zip")) fileDir += ".zip";

    const archiver = require("archiver");
    const fse = require("fs-extra");
    const attachmentDir = getAttachmentDir(id);
    const archive = archiver("zip");
    const output = fse.createWriteStream(fileDir);

    output.on("close", () => {
      let notification = new Notification({
        title: "Lyan",
        body: "Attachments successfully exported to " + fileDir,
      });

      notification.show();

      notification.on("click", () => shell.openPath(fileDir));
    });

    archive.on("error", (err) => console.log("err", err));

    archive.pipe(output);

    archive.directory(attachmentDir, id, { date: new Date() });

    archive.finalize();
  },
  importAttachments: () => {
    const mainWindow = BrowserWindow.getFocusedWindow();

    dir = dialog.showOpenDialogSync(mainWindow, {
      filters: [{ name: "Zip File", extensions: ["zip"] }],
      title: "Import",
    });

    if (!dir) return;

    const unzipper = require("unzipper");

    const stream = fs
      .createReadStream(dir[0])
      .pipe(unzipper.Extract({ path: getAttachmentDir() }));

    stream.on("error", (err) => {
      console.log(err);
    });

    stream.on("close", () => {
      mainWindow.webContents.send("reset-sub-path");

      new Notification({
        title: "Lyan",
        body: "Attachments successfully imported.",
      }).show();
    });
  },
  about: () => {
    const packageJson = require("../../../package.json");

    dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      type: "info",
      buttons: ["OK"],
      title: "About",
      message: `Lyan v${packageJson.version}`,
    });
  },
  confirm,
  alert,
};

function newDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
}

function getDir(dir) {
  dir = getAttachmentDir(dir);

  try {
    const data = fs.readdirSync(dir);

    let files = [],
      folders = [];

    for (let item of data) {
      if (isDir(path.join(dir, item))) {
        folders.push({ name: item });
      } else {
        files.push({ name: item });
      }
    }

    return { folders, files };
  } catch (err) {
    return { folders: [], files: [] };
  }
}

function isDir(dir) {
  try {
    if (fs.lstatSync(dir).isDirectory()) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

function removeDir(dir) {
  if (!dir) return;

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);

    files.forEach((filename) => {
      let fullPath = path.join(dir, filename);

      if (isDir(fullPath)) {
        removeDir(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    });

    fs.rmdirSync(dir);
  }
}

function getAttachmentDir(...args) {
  args = args.filter(Boolean);

  return path.join(app.getPath("userData"), "attachments", ...args);
}

function activeExport(event, id) {
  if (!id) return;

  let { files, folders } = getDir(id);

  if (files.length === 0 && folders.length === 0) return;

  let menu = Menu.get();
  let exportAttachments = menu.getMenuItemById("export");
  let deleteAttachments = menu.getMenuItemById("delete");

  exportAttachments.enabled = true;
  deleteAttachments.enabled = true;
}

function deactiveExport(event, id) {
  if (id) {
    let { files, folders } = getDir(id);

    if (files.length > 0 || folders.length > 0) return;
  }

  let menu = Menu.get();
  let exportAttachments = menu.getMenuItemById("export");
  let deleteAttachments = menu.getMenuItemById("delete");

  exportAttachments.enabled = false;
  deleteAttachments.enabled = false;
}

function activeReports() {
  let menu = Menu.get();
  let reports = menu.getMenuItemById("reports");
  let { resetViewMessage } = require("../menu");

  reports.enabled = true;
  menu.getMenuItemById("default").checked = true;
  resetViewMessage();
}

function deactiveReports() {
  let menu = Menu.get();
  let reports = menu.getMenuItemById("reports");
  let { resetViewMessage } = require("../menu");

  reports.enabled = false;
  menu.getMenuItemById("default").checked = true;
  resetViewMessage();
}

async function confirm(event, message) {
  let response = await new Promise((resolve) => {
    dialog
      .showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: "question",
        buttons: ["Cancel", "OK"],
        title: "Lyan",
        message,
      })
      .then(({ response }) => resolve(response));
  });

  response = response === 1 ? true : false;

  if (event) {
    event.returnValue = response;
  } else {
    return response;
  }
}

function alert(event, message) {
  dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    type: "info",
    buttons: ["OK"],
    title: "Lyan",
    message,
  });
}
