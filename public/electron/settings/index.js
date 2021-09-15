const Store = require("electron-store");
const store = new Store();
const settings = {
  language: "en",
  digit: "en",
  direction: "ltr",
  calendar: "gregorian",
  decimal: ".",
  dateFormat: "YYYY/MM/DD",
  timeFormat: "hh:mm:ss a",
  calendarColor: "default",
  calendarBackground: "default",
  themeColor: "purple",
  digits: {
    en: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    fa: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
    ar: ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],
    hi: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
  },
  weekStartDayIndex: 0,
  mainWindow: {
    width: 1400,
    height: 800,
  },
  sidebar: {
    drag: { x: 0, y: 0 },
    delta: { x: 0, y: 0 },
    width: 250,
  },
  main: {
    width: "calc(100% - 255px)",
  },
  recentFiles: [],
};

module.exports = {
  get,
  set,
  update,
};

function get() {
  return store.get("settings") || settings;
}

function set(settings) {
  store.set("settings", settings);
}

function update(key, value) {
  let settings = get();

  settings[key] = value;

  set(settings);
}
