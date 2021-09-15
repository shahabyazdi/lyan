export default function findTarget(schema, item, doc) {
  let sheet = doc.sheets.find((sheet) => sheet?.id === schema.connectedSheet);

  let connection = findFirstAvailableConnection(item, sheet);
  let targetItem = findTargetItem(sheet, connection);

  schema = sheet?.schemas?.find?.((s) => s.id === schema.connectedElement);

  if (schema) schema = { ...schema };
  if (schema?.element === "connection")
    return findTarget(schema, targetItem, doc);

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
