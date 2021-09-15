import getItemNameFromId from "./getItemNameFromId";

export default function getValue(doc, sheetIndex, itemIndex, schema, value) {
  switch (schema.type) {
    case "sheet item":
    case "connection sheet item":
      value = getItemNameFromId(doc, schema.sheet, value);
      break;
    default:
      break;
  }

  return value;
}
