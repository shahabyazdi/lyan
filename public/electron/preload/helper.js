const { ipcRenderer } = require("electron");
const getMode = require("../shared/getMode");

class Helper {
  constructor(store) {
    this.store = store;
  }

  openFile = (event, doc, path, name) => {
    const store = this.store;

    try {
      doc = JSON.parse(doc);

      store.dispatch({
        type: "OPEN_DOC",
        mode: "file",
        doc,
        path,
        name,
      });
    } catch (err) {
      ipcRenderer.send("alert", err.toString());

      store.dispatch({
        type: "UPDATE_SETTINGS",
        //updating recent files
        settings: require("../settings/index").get(),
      });
    }
  };

  save = () => {
    let checkRequiredElements = require("../shared/checkRequiredElements"),
      store = this.store,
      state = store.getState(),
      { mode, doc, templateIndex, fileLocation } = state,
      { valid, message } = checkRequiredElements(state),
      data = {};

    if (!valid) return ipcRenderer.send("alert", message);

    if (mode === "template") {
      data = doc;

      this.deactiveClose();
    } else if (mode === "edit") {
      let templates = JSON.parse(ipcRenderer.sendSync("get-templates"));

      templates[templateIndex] = doc;

      data = templates;
    } else if (["file", "reports"].includes(mode)) {
      data = doc;
    }

    let location = ipcRenderer.sendSync(
      "save",
      JSON.stringify(data, undefined, 2),
      fileLocation,
      mode
    );

    if (mode === "file" && !location) return;

    if (mode === "edit") {
      this.deactiveClose();
    } else if (["file", "reports"].includes(mode)) {
      this.deactiveSave();
    }

    if (mode === "file") {
      store.dispatch({
        type: "SET_FILE_LOCATION",
        location,
      });
    }

    let name = "";

    if (mode === "template") name = template.name;

    if (mode === "file") {
      name = location.split(/\\|\//);

      name = name[name.length - 1].split(".");
      name = name[0];
    }

    document.title = name + " - Lyan";
  };

  close = () => {
    this.deactiveClose();

    this.store.dispatch({ type: "CLOSE" });
  };

  openSettings = () => {
    let store = this.store,
      { mode, defaultSections } = store.getState();

    if (mode === "default") {
      store.dispatch({
        type: "SET_SHEET_INDEX",
        index: defaultSections.findIndex(({ name }) => name === "Settings"),
      });
    } else {
      store.dispatch({ type: "OPEN_SETTINGS" });
    }
  };

  handleOpen = async () => {
    let state = this.store.getState();
    let checkRequiredElements = require("../shared/checkRequiredElements");

    if (state.save) {
      let { valid, message } = checkRequiredElements(state);

      if (!valid) return ipcRenderer.send("alert", message);

      let response = ipcRenderer.sendSync(
        "confirm",
        `${getMode(state.mode)} not saved, Close anyway?`
      );

      if (!response) return;
    }

    ipcRenderer.send("open");
  };

  handleExport = () => {
    ipcRenderer.send("export-attachments", this.store.getState().doc.id);
  };

  handleClose = () => {
    ipcRenderer.send("close", JSON.stringify(this.store.getState()));
  };

  handleExit = () => {
    ipcRenderer.send("exit-response", JSON.stringify(this.store.getState()));
  };

  handleDeleteAttachment = () => {
    let response = ipcRenderer.sendSync(
      "confirm",
      "are you sure you want to delete all attachments of this file?"
    );

    if (!response) return;

    let store = this.store,
      { doc } = store.getState();

    ipcRenderer.sendSync("delete-attachments", doc.id);

    store.dispatch({
      type: "SET_ATTACHMENT_SUB_PATH",
      path: [],
    });
  };

  resetSubPath = () => {
    this.store.dispatch({
      type: "SET_ATTACHMENT_SUB_PATH",
      path: [],
    });
  };

  deactiveSave() {
    ipcRenderer.send("deactive-save");
  }

  deactiveClose() {
    document.title = "Lyan";

    ipcRenderer.send("deactive-close");
    ipcRenderer.send("deactive-save");
    ipcRenderer.send("deactive-reports");
  }

  toggleView = (requestedMode) => {
    let store = this.store;
    let { mode } = store.getState();

    if (!["file", "reports"].includes(mode)) mode = "default";
    if (requestedMode === mode) return;

    store.dispatch({
      type: "TOGGLE_VIEW",
    });
  };
}

module.exports = Helper;
