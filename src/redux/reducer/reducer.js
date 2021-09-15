import { types } from "../actions/actions.js";
import collectConnectionElements from "../../shared/collectConnectionElements";
import collectMixedValues from "../../shared/collectMixedValues";
import calculateValues from "../../shared/calculateValues";
import getValue from "../../shared/getValue";
import getNewDoc from "../../shared/getNewDoc.js";
import DateObject from "react-date-object";
import Settings from "../../components/default_sections/settings/settings";
import fa from "../../languages/fa.json";
import { ObjectID } from "bson";

let settings = api.getSettings();

const language = { fa };
const getId = () => new ObjectID().toHexString();
const toLocaleDigits = getToLocaleDigits();
const toEnglishDigits = getToEnglishDigits();

const initialState = {
  mode: "default",
  sheetIndex: 0,
  settings,
  language,
  translate: getTranslate(),
  toLocaleDigits,
  forms: [],
  formZIndex: 1,
  zIndex: {},
  subPath: [],
  formatDate: getFormatDate(),
  toLocale: (string) => toLocaleDigits(string),
  toEnglishDigits,
  getId,
  activeTab: { id: "elements" },
  defaultSections: [
    { name: "New" },
    { name: "Open" },
    { name: "Edit" },
    { name: "Settings" },
  ],
};

document.title = initialState.translate("Lyan");

function reducer(state = initialState, action) {
  let variables = {};
  let newState, itemStatus, title, doc;
  let { translate, toLocaleDigits, toLocale } = state;

  switch (action.type) {
    case types.NEW_DOC:
      doc = getNewDoc(action, state);

      if (action.mode === "template") {
        title = `${doc.name} - ${translate("Lyan")}`;
      } else {
        title = `${translate("untitled file")} - ${translate("Lyan")}`;
        toLocale = getToLocale(state, doc.variables[state.settings.language]);

        activeReports();
      }

      document.title = title;

      activeSave();
      activeClose();

      return {
        ...state,
        mode: action.mode,
        doc,
        save: true,
        sheetIndex: undefined,
        toLocale,
      };
    case types.UPDATE_DOC:
      activeSave();

      state = {
        ...state,
        doc: { ...action.doc },
        save: true,
      };

      if (state.mode === "file") {
        getSchemas(state, action.rerender);

        if (action.getConnectionSchemas) collectConnectionElements(state);
        if (action.recalculate) calculateValues(state);
      }

      return state;
    case types.OPEN_DOC:
      doc = action.doc;

      if (action.mode === "file") {
        //opening file
        title = action.name.replace(/\.lmsf$/, "") + " - " + translate("Lyan");

        activeClose(doc.id);
        activeReports();

        state.fileLocation = action.path;
        state.fileName = action.name;
        state.settings = api.getSettings();
      } else {
        activeClose();

        document.title =
          toLocaleDigits(variables[doc.name] || doc.name) +
          " - " +
          state.translate("Lyan");

        state.templateIndex = action.index;
      }

      document.title = title;

      return {
        ...state,
        doc,
        sheetIndex: undefined,
        save: false,
        mode: action.mode,
        toLocale: getToLocale(state, doc.variables[state.settings.language]),
      };
    case types.SET_SHEET_INDEX:
      itemStatus = api.checkRequiredElements(state);

      if (!itemStatus.valid) {
        api.alert(itemStatus.message);

        return state;
      }

      state = {
        ...state,
        sheetIndex: action.index,
        itemIndex: undefined,
        subPath: [],
      };

      getSchemas(state);

      return state;
    case types.NEW_SHEET:
      state.doc.sheets.push({
        id: getId(),
        name: "sheet-" + state.doc.sheets.length,
        date: Date.now(),
        schemas: [],
        items: [],
        descriptions: "",
      });

      activeSave();

      return {
        ...state,
        doc: { ...state.doc },
        save: true,
      };
    case types.NEW_ITEM:
      state.doc.sheets[state.sheetIndex].items.push({
        id: getId(),
        name: "item-" + state.doc.sheets[state.sheetIndex].items.length,
        date: Date.now(),
        values: {},
        descriptions: "",
      });

      activeSave();

      return {
        ...state,
        doc: { ...state.doc },
        save: true,
      };
    case types.UPDATE_VALUE:
      let mustGetConnections = false;

      if (action.schema) {
        let { schema, value, sheetIndex, itemIndex, rowIndex, columnIndex } =
          action;

        let sheet = state.doc.sheets[sheetIndex];

        let schemaIndex =
          schema.schemaindex ||
          state.doc.sheets[sheetIndex].schemas.findIndex(
            ({ id }) => id === schema.id
          );

        newState =
          state.mode === "reports"
            ? { ...state, sheetIndex, itemIndex }
            : state;

        if (rowIndex === undefined) {
          state.doc.sheets[sheetIndex].items[itemIndex].values[schema.id] =
            value;

          mustGetConnections =
            state.doc.sheets[sheetIndex].schemas[schemaIndex].type ===
            "connection sheet item";

          if (sheet.itemFormat === "element" && schema.itemName) {
            if (
              typeof state.doc.sheets[sheetIndex].items[itemIndex].name ===
              "string"
            ) {
              state.doc.sheets[sheetIndex].items[itemIndex].name = {};
            }

            state.doc.sheets[sheetIndex].items[itemIndex].name[schema.id] =
              getValue(state.doc, sheetIndex, itemIndex, schema, value);
          }
        } else {
          state.doc.sheets[sheetIndex].items[itemIndex].values[schema.id][
            rowIndex
          ][columnIndex] = value;

          mustGetConnections =
            state.doc.sheets[sheetIndex].schemas[schemaIndex].schemas[
              columnIndex
            ].type === "connection sheet item";
        }
      }

      if (mustGetConnections) {
        collectConnectionElements(newState);
        getSchemas(newState, true);
      }

      if (action.refresh) getSchemas(newState, true);

      activeSave();
      calculateValues(newState);

      if (state.mode === "reports") {
        window.itemsWithConnection.forEach((item) => {
          collectConnectionElements({
            ...newState,
            sheetIndex: item.sheetIndex,
            itemIndex: item.index,
          });
        });
      }

      return {
        ...state,
        doc: { ...state.doc },
        save: true,
      };
    case types.SET_ITEM_INDEX:
      itemStatus = api.checkRequiredElements(state);

      if (!itemStatus.valid) {
        api.alert(itemStatus.message);

        return state;
      }

      state = {
        ...state,
        itemIndex: action.index,
        subPath: [],
      };

      if (state.activeTab.id === "elements") {
        collectConnectionElements(state);
        collectMixedValues(state);
        calculateValues(state);
      }

      return state;
    case types.SET_FILE_LOCATION:
      return {
        ...state,
        fileLocation: action.location,
        fileName: action.location.split(/\\|\//).pop(),
        save: false,
      };
    case types.NEW_FORM:
      let forms = state.forms;
      let lastForm = forms[forms.length - 1];
      let id = lastForm ? lastForm.id + 1 : 1;
      let newForm = { ...action.data, id };

      return {
        ...state,
        forms: state.forms.concat(newForm),
      };
    case types.CLOSE_FORM:
      return {
        ...state,
        forms: state.forms.filter((form) => form.id !== action.id),
      };
    case types.DELETE_SCHEMA:
      state.doc.sheets[state.sheetIndex].schemas = state.doc.sheets[
        state.sheetIndex
      ].schemas.filter((schema) => schema.id !== action.schema.id);

      let sheet = state.doc.sheets[state.sheetIndex];

      sheet.items.forEach((item, index) => {
        delete state.doc.sheets[state.sheetIndex].items[index].values[
          action.schema.id
        ];
      });

      state = {
        ...state,
        doc: { ...state.doc },
        save: true,
      };

      activeSave();
      getSchemas(state);
      calculateValues(state);

      return state;
    case types.DELETE_SHEET:
      state.doc.sheets = state.doc.sheets.filter(
        (sheet, index) => index !== action.sheetIndex
      );

      activeSave();

      return {
        ...state,
        doc: { ...state.doc },
        sheetIndex:
          state.sheetIndex === action.sheetIndex ? undefined : state.sheetIndex,
        itemIndex:
          state.sheetIndex === action.sheetIndex ? undefined : state.itemIndex,
        save: true,
      };
    case types.DELETE_ITEM:
      state.doc.sheets[action.sheetIndex].items = state.doc.sheets[
        action.sheetIndex
      ].items.filter((item, i) => i !== action.itemIndex);

      state.doc.connections = state.doc.connections.filter(
        (connection) =>
          connection.parent.item !== action.item.id &&
          connection.item !== action.item.id
      );

      activeSave();

      return {
        ...state,
        doc: { ...state.doc },
        itemIndex:
          state.itemIndex === action.itemIndex
            ? undefined
            : state.itemIndex > action.itemIndex
            ? state.itemIndex - 1
            : state.itemIndex,
        save: true,
      };
    case types.CLOSE_SHEET:
      itemStatus = api.checkRequiredElements(state);

      if (!itemStatus.valid) {
        api.alert(itemStatus.message);

        return state;
      }

      return {
        ...state,
        sheetIndex: undefined,
        itemIndex: undefined,
      };
    case types.CLOSE_ITEM:
      itemStatus = api.checkRequiredElements(state);

      if (!itemStatus.valid) {
        api.alert(itemStatus.message);

        return state;
      }

      return {
        ...state,
        itemIndex: undefined,
      };
    case types.CLOSE:
      newState = {
        ...initialState,
        settings: state.settings,
        toLocaleDigits: getToLocaleDigits(),
        toEnglishDigits: getToEnglishDigits(),
        formatDate: getFormatDate(),
      };

      document.title = newState.translate("Lyan");

      return newState;
    case types.SET_FORM_Z_INDEX:
      let number = state.formZIndex + 1;

      return {
        ...state,
        formZIndex: number,
        zIndex: { ...state.zIndex, [action.id]: number },
      };
    case types.MOVE_ELEMENT:
      let key = state.mode === "file" ? "file" : "template";

      if (action.what) {
        let { sheetIndex } = state,
          { from, where, what } = action,
          i = from + (where === "up" ? -1 : 1),
          array = [];

        let condition = () => {
          if (where === "up") return i >= 0;
          if (where === "down") return i < array.length;
        };

        let increase = () => {
          if (where === "up") i--;
          if (where === "down") i++;
        };

        if (what === "schema") {
          array = state.doc.sheets[sheetIndex].schemas;

          while (condition()) {
            if (array[i].group === array[from].group) {
              let target = { ...array[i] };

              array[i] = { ...array[from] };
              array[from] = target;

              break;
            }

            increase();
          }

          state.doc.sheets[sheetIndex].schemas = array;

          getSchemas(state);
        } else {
          array =
            what === "sheet"
              ? state.doc.sheets
              : state.doc.sheets[state.sheetIndex].items;

          while (condition()) {
            if (!array[i].temp) {
              let target = { ...array[i] };

              array[i] = { ...array[from] };
              array[from] = target;
              break;
            }

            increase();
          }

          if (what === "sheet") {
            state.doc.sheets = array;
          } else {
            state.doc.sheets[state.sheetIndex].items = array;
          }
        }
      }

      activeSave();

      return {
        ...state,
        [key]: { ...state.doc },
        save: true,
      };
    case types.SET_ATTACHMENT_SUB_PATH:
      return {
        ...state,
        subPath: action.path,
      };
    case types.OPEN_SETTINGS:
      return {
        ...state,
        forms: [
          ...state.forms,
          {
            title: "Settings",
            body: <Settings />,
            id: (state.forms[state.forms.length - 1]?.id || 0) + 1,
          },
        ],
      };
    case types.UPDATE_SETTINGS:
      let prevName = state.translate("Lyan");

      settings = {
        ...api.getSettings(),
        ...action.settings,
      };

      api.saveSettings(settings);

      state = {
        ...state,
        settings,
        translate: getTranslate(),
        toLocaleDigits: getToLocaleDigits(),
        formatDate: getFormatDate(),
      };

      state.toLocale = getToLocale(
        state,
        state[state.mode === "template" ? "template" : "file"]?.variables?.[
          settings.language
        ]
      );

      document.title = document.title.replace(
        new RegExp(`${prevName}$`),
        state.translate("Lyan")
      );

      return state;
    case types.SET_ACTIVE_TAB:
      if (action.tab.id === "elements") {
        collectMixedValues(state);
        calculateValues(state);
      }

      return {
        ...state,
        activeTab: action.tab,
      };
    case types.TOGGLE_VIEW:
      return {
        ...state,
        mode: state.mode === "reports" ? "file" : "reports",
      };
    case types.REFRESH_ELEMENTS:
      getSchemas(state, true);
      return state;
    default:
      return state;
  }
}

export default reducer;

function activeSave() {
  api.activeSave();
}

function activeClose(id) {
  api.activeClose(id);
}

function activeReports() {
  api.activeReports();
}

function getTranslate() {
  return (string) => language?.[settings.language]?.[string] || string;
}

function getToLocaleDigits() {
  return function (string) {
    if (string instanceof DateObject || Array.isArray(string)) return string;

    return (string?.toString?.() ?? "")
      .toString()
      .replace(/[0-9]/g, (w) => settings.digits[settings.digit][w]);
  };
}

function getToEnglishDigits() {
  return function (string) {
    if (
      string instanceof DateObject ||
      Array.isArray(string) ||
      typeof string === "number"
    ) {
      return string;
    }

    settings.digits[settings.digit].forEach((digit) => {
      string = string?.replaceAll?.(
        digit,
        settings.digits[settings.digit].indexOf(digit)
      );
    });

    return string;
  };
}

function getToLocale(state, array = []) {
  let variables = Object.fromEntries(array);

  return (string) => state.toLocaleDigits(variables[string] || string);
}

function getFormatDate() {
  return (date) => {
    if (!date) return "";

    return new DateObject({
      date,
      calendar: settings.calendar,
      locale: settings.language,
      format: settings.dateFormat + " " + settings.timeFormat,
    }).format();
  };
}

var stringSchemas = "";

function getSchemas({ doc, sheetIndex, mode, ...state }, force) {
  if (sheetIndex === undefined || !["file", "reports"].includes(mode)) return;

  const sheet = doc.sheets[sheetIndex];
  const newSchemas = sheet.schemas.filter((schema) => !schema.temp);

  if (JSON.stringify(newSchemas) !== stringSchemas || force) {
    window.schemas = newSchemas;
    stringSchemas = JSON.stringify(window.schemas);

    collectMixedValues({ doc, sheetIndex, mode, ...state });
  }
}
