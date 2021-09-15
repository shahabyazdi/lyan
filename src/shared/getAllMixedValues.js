import getMixedValues from "./getMixedValues";

export default function getAllMixedValues(
  doc,
  sheet,
  item,
  schemas = sheet.schemas.filter((schema) => !schema.temp)
) {
  let mixedValues = {};

  schemas.forEach((schema) => {
    if (schema.element === "table" && schema.mix) {
      mixedValues[schema.id] = getMixedValues(schema, item, doc, sheet);
    } else if (!schema.mix && mixedValues[schema.id]) {
      delete mixedValues[schema.id];
    }
  });

  return mixedValues;
}
