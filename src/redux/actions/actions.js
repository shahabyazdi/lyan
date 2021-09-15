export const types = {
  NEW_DOC: "NEW_DOC",
  UPDATE_DOC: "UPDATE_DOC",
  OPEN_DOC: "OPEN_DOC",
  SET_SHEET_INDEX: "SET_SHEET_INDEX",
  NEW_SHEET: "NEW_SHEET",
  UPDATE_SCHEMA: "UPDATE_SCHEMA",
  NEW_ITEM: "NEW_ITEM",
  SET_ITEM_INDEX: "SET_ITEM_INDEX",
  SET_FILE_LOCATION: "SET_FILE_LOCATION",
  NEW_FORM: "NEW_FORM",
  CLOSE_FORM: "CLOSE_FORM",
  DELETE_SCHEMA: "DELETE_SCHEMA",
  DELETE_ITEM: "DELETE_ITEM",
  DELETE_SHEET: "SELETE_SHEET",
  CLOSE_ITEM: "CLOSE_ITEM",
  CLOSE_SHEET: "CLOSE_SHEET",
  CLOSE: "CLOSE",
  UPDATE_VALUE: "UPDATE_VALUE",
  SET_FORM_Z_INDEX: "SET_FORM_Z_INDEX",
  MOVE_ELEMENT: "MOVE_ELEMENT",
  SET_ATTACHMENT_SUB_PATH: "SET_ATTACHMENT_SUB_PATH",
  OPEN_SETTINGS: "OPEN_SETTINGS",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  SET_ACTIVE_TAB: "SET_ACTIVE_TAB",
  TOGGLE_VIEW: "TOGGLE_VIEW",
  REFRESH_ELEMENTS: "REFRESH_ELEMENTS",
};

export function newDoc(mode, template) {
  return {
    type: types.NEW_DOC,
    mode,
    template,
  };
}

export function updateDoc(doc, options = {}) {
  return {
    type: types.UPDATE_DOC,
    doc,
    ...options,
  };
}

export function openDoc(doc, options = {}) {
  return {
    type: types.OPEN_DOC,
    doc,
    ...options,
  };
}

export function setSheetIndex(index) {
  return {
    type: types.SET_SHEET_INDEX,
    index,
  };
}

export function newSheet(key) {
  return {
    type: types.NEW_SHEET,
    key,
  };
}

export function newItem() {
  return {
    type: types.NEW_ITEM,
  };
}

export function setItemIndex(index) {
  return {
    type: types.SET_ITEM_INDEX,
    index,
  };
}

export function setFileLocation(location) {
  return {
    type: types.SET_FILE_LOCATION,
    location,
  };
}

export function newForm(data) {
  return {
    type: types.NEW_FORM,
    data,
  };
}

export function closeForm(id) {
  return {
    type: types.CLOSE_FORM,
    id,
  };
}

export function deleteSchema(schema) {
  return {
    type: types.DELETE_SCHEMA,
    schema,
  };
}

export function updateValue(
  schema,
  value,
  sheetIndex,
  itemIndex,
  rowIndex,
  columnIndex,
  refresh
) {
  return {
    type: types.UPDATE_VALUE,
    schema,
    value,
    sheetIndex,
    itemIndex,
    rowIndex,
    columnIndex,
    refresh,
  };
}

export function deleteSheet(sheetIndex) {
  return {
    type: types.DELETE_SHEET,
    sheetIndex,
  };
}

export function deleteItem(sheetIndex, itemIndex, item) {
  return {
    type: types.DELETE_ITEM,
    sheetIndex,
    itemIndex,
    item,
  };
}

export function closeSheet() {
  return {
    type: types.CLOSE_SHEET,
  };
}

export function closeItem() {
  return {
    type: types.CLOSE_ITEM,
  };
}

export function close() {
  return {
    type: types.CLOSE,
  };
}

export function setFormZIndex(id) {
  return {
    type: types.SET_FORM_Z_INDEX,
    id,
  };
}

export function moveElement(from, where, what = "schema") {
  return {
    type: types.MOVE_ELEMENT,
    from,
    where,
    what,
  };
}

export function setAttachmentSubPath(path) {
  return {
    type: types.SET_ATTACHMENT_SUB_PATH,
    path,
  };
}

export function updateSettings(settings) {
  return {
    type: types.UPDATE_SETTINGS,
    settings,
  };
}

export function setActiveTab(tab) {
  return {
    type: types.SET_ACTIVE_TAB,
    tab,
  };
}

export function refreshElements() {
  return {
    type: types.REFRESH_ELEMENTS,
  };
}
