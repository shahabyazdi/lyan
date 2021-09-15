import getAllMixedValues from "./getAllMixedValues";
import getAllOperationValues from "./getAllOperationValues";

export default function getAllConnectionValues(doc, sheet, item) {
  let connections = {};
  let values = {};

  sheet.schemas.forEach((originalSchema) => {
    let schema = { ...originalSchema };

    if (schema.element === "connection") {
      let [targetSchema, targetItem, targetSheet] = findTarget(
        schema,
        item,
        doc
      );

      if (!targetItem || !targetSheet) {
        targetSchema.value = "this element is not connected to target item.";
      } else if (
        targetSchema.element === "operation" ||
        (targetSchema.element === "table" &&
          (targetSchema.mix ||
            targetSchema.schemas.some(
              (schema) => schema.element === "operation"
            )))
      ) {
        let targetSchemas = targetSheet.schemas;
        let targetValues = targetItem.values;

        //last shot
        let [connectionValuesOfTargetItem] = getAllConnectionValues(
          doc,
          targetSheet,
          targetItem
        );

        let mixedValueOfTargetItem = getAllMixedValues(
          doc,
          targetSheet,
          targetItem
        );

        let valuesOfTargetItem = getAllOperationValues(
          {
            ...targetValues,
            ...connectionValuesOfTargetItem,
          },
          targetSchemas,
          mixedValueOfTargetItem
        );

        let targetValue = valuesOfTargetItem[targetSchema.id];

        targetSchema.value = targetValue?.wait ? "Error" : targetValue;
      } else {
        targetSchema.value = targetItem.values[targetSchema.id];
      }

      values[schema.id] = targetSchema.value;
      connections[schema.id] = targetSchema;
    }
  });

  return [values, connections];
}

export function findTarget(schema, item, doc) {
  let sheet = doc.sheets.find((sheet) => sheet?.id === schema.connectedSheet);

  let connection = findFirstAvailableConnection(item, sheet);
  let targetItem = findTargetItem(sheet, connection);

  schema = sheet?.schemas?.find?.((s) => s.id === schema.connectedElement);

  if (schema) schema = { ...schema };

  if (schema?.element === "connection") {
    return findTarget(schema, targetItem, doc);
  }

  return [schema, targetItem, sheet];

  function findFirstAvailableConnection(item, sheet) {
    /**
     * Search for the first connection of current item (connection.parent.item === item.id )
     * that its sheet is the same as the sheet of connected element (connection.sheet === schema.connectedSheet).
     */
    return doc.connections.find(
      (connection) =>
        connection.parent.item === item?.id && connection.sheet === sheet?.id
    );
  }

  function findTargetItem(sheet, connection) {
    return sheet?.items?.find?.((item) => item?.id === connection?.item);
  }
}
