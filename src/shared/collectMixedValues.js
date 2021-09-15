import getAllMixedValues from "./getAllMixedValues";

export default function collectMixedValues({
  doc,
  sheetIndex,
  itemIndex,
  mode,
}) {
  if (itemIndex === undefined) return;

  const sheet = doc.sheets[sheetIndex];
  const item = sheet.items[itemIndex];
  const schemas = mode === "reports" ? sheet.schemas : window.schemas;
  const mixedValues = getAllMixedValues(doc, sheet, item, schemas);

  if (!window.mixedValues || mode === "file") window.mixedValues = {};

  window.mixedValues[item.id] = mixedValues;
}
