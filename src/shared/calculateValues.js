import getAllOperationValues from "./getAllOperationValues.js";

export default function calculateValues({
  doc,
  sheetIndex,
  itemIndex = 0,
  mode,
}) {
  const sheet = doc.sheets[sheetIndex];
  const item = sheet.items[itemIndex];
  const newValues = sheet.items[itemIndex].values;
  const strValues = JSON.stringify(newValues);
  const schemas = mode === "reports" ? sheet.schemas : window.schemas;

  if (!window.values || mode === "file") window.values = {};

  if (strValues !== JSON.stringify(window.values[item.id] || {})) {
    window.values[item.id] = {
      ...JSON.parse(strValues),
      ...window.connectionValues?.[item.id],
    };

    window.values[item.id] = getAllOperationValues(
      window.values?.[item.id],
      schemas,
      window.mixedValues?.[item.id]
    );

    for (let id in window.mixedValues?.[item.id] || []) {
      let mixedValue = window.mixedValues?.[item.id][id];
      let schema = schemas.find((schema) => schema.id === id);

      if (
        !Array.isArray(mixedValue) ||
        (!schema?.mix &&
          schema?.schemas.every((schema) => schema.element !== "operation"))
      ) {
        continue;
      }

      let value = window.values?.[item.id][id];

      if (!Array.isArray(value) || mixedValue.length === 0) continue;

      value = [...value];

      let newValue = value.splice(0, mixedValue.length);

      window.values[item.id][id] = value;
      window.mixedValues[item.id][id] = newValue;
    }
  }
}
