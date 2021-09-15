import DateObject from "react-date-object";

export default function mustLocalizeValue({ element, type, value }) {
  return (
    !["table"].includes(element) &&
    ![
      "date",
      "time",
      "month",
      "year",
      "week",
      "checkbox",
      "switch",
      "color",
      "number",
    ].includes(type) &&
    !Array.isArray(value) &&
    !(value instanceof DateObject) &&
    typeof value !== "boolean"
  );
}
