import getAllConnectionValues from "./getAllConnectionValues";

export default function collectConnectionElements({
  doc,
  sheetIndex,
  itemIndex,
  mode,
}) {
  if (itemIndex === undefined) return;

  const sheet = doc.sheets[sheetIndex];
  const item = sheet.items[itemIndex];
  const [values, connections] = getAllConnectionValues(doc, sheet, item);

  if (!window.connectionValues || mode === "file") window.connectionValues = {};
  if (!window.connections || mode === "file") window.connections = {};

  window.connectionValues[item.id] = values;
  window.connections[item.id] = connections;
}
