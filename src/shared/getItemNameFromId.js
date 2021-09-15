import getItemName from "./getItemName";

export default function getItemNameFromId(doc, sheetId, itemId) {
  let sheet = doc.sheets.find((sheet) => sheet.id === sheetId);
  let item = sheet?.items?.find?.((item) => item.id === itemId);

  return item ? getItemName(item, sheet, doc) : "";
}
