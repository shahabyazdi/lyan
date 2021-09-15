import getItemName from "./getItemName";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import AnalogTimePicker from "react-multi-date-picker/plugins/analog_time_picker";
import { calendars, locales } from "./calendars_and_locales";

export default function getValidSchema(
  originalSchema,
  doc,
  settings,
  toLocale,
  toLocaleDigits,
  languages
) {
  let schema = { ...originalSchema };
  let localize = (string) => toLocaleDigits(toLocale(string));

  let {
    digits,
    language,
    decimal,
    calendar,
    dateFormat,
    timeFormat,
    weekStartDayIndex,
    direction,
  } = settings;

  schema.digits = digits[settings.digit];
  schema.name = localize(schema.name);

  if (["select", "multi select", "table"].includes(schema.element)) {
    schema.labels = languages[language];
  }

  switch (schema.type) {
    case "number":
    case "formula":
      if (schema.separator) schema.separator = ",";

      schema.decimal = decimal || ".";
      break;
    case "date":
      let { timePicker, mode } = schema;
      let position = ["fa", "ar"].includes(language) ? "left" : "right";

      schema = {
        ...schema,
        calendar: calendars[calendar],
        locale: locales[`${calendar}_${language}`],
        range: schema.mode === "range",
        multiple: schema.mode === "multiple",
        format: dateFormat,
        weekStartDayIndex: weekStartDayIndex,
        containerClassName: `full-width ${language}`,
        className: `${settings.calendarColor} ${settings.calendarBackground}`,
        inputClass: `full-width ${
          schema.direction ? "direction-" + schema.direction : ""
        }`,
        plugins: [
          <AnalogTimePicker
            disabled={!timePicker || mode !== "single"}
            position={position}
          />,
          <TimePicker
            position="left"
            disabled={!timePicker || mode === "single"}
          />,
          <DatePanel disabled={mode === "single"} position={position} />,
        ],
      };

      if (timePicker) schema.format = schema.format + " " + timeFormat;

      break;
    case "time":
    case "year":
    case "month":
    case "week":
      schema = {
        ...schema,
        calendar: calendars[calendar],
        locale: locales[`${calendar}_${language}`],
        containerClassName: `full-width ${language}`,
        inputClass: "full-width",
        className: `${settings.calendarColor} ${settings.calendarBackground}`,
      };

      if (schema.type === "time") schema.format = timeFormat;
      if (schema.type === "month") schema.format = "MMMM YYYY";
      break;
    case "textarea":
      schema.rows = 5;
      break;
    case "manual":
      if (schema.element === "select") {
        schema.options = schema.options.map(([text, value]) => [
          localize(text),
          toLocaleDigits(value),
        ]);
      } else if (schema.element === "multi select") {
        schema.options = schema.options.map(([text, value]) => ({
          text: localize(text),
          value: toLocaleDigits(value),
        }));
      }
      break;
    case "sheet item":
    case "connection sheet item":
      if (!schema.mixItems) {
        let sheet = doc.sheets.find((sheet) => sheet.id === schema.sheet);

        if (sheet)
          schema.options = sheet.items
            .filter((item) => !item.temp)
            .map((item) => [
              toLocaleDigits(getItemName(item, sheet, doc)),
              toLocaleDigits(item.id),
            ]);
      } else {
        let sheets = doc.sheets.filter((sheet) =>
          schema.sheets.includes(sheet.id)
        );

        let items = [];

        if (sheets.length > 0)
          items = sheets.map((sheet) =>
            sheet.items.map((item) => {
              let name = getItemName(item, sheet, doc);

              name =
                schema.itemFormat === "sheetItem"
                  ? localize(sheet.name) + ": " + toLocaleDigits(name)
                  : toLocaleDigits(name);

              return [name, toLocaleDigits(item.id)];
            })
          );

        schema.options = [];

        if (items.length > 0) {
          items.forEach((item) => {
            schema.options = schema.options.concat(item);
          });
        }
      }
      break;
    case "schema":
      if (schema.element === "table") {
        schema.rtl = direction === "rtl";

        schema.schemas = schema.schemas.map((originalSchema) =>
          getValidSchema(
            originalSchema,
            doc,
            settings,
            toLocale,
            toLocaleDigits,
            languages
          )
        );
      }
      break;
    default:
      break;
  }

  return schema;
}
