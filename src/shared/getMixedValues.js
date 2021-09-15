export default function getMixedValues(schema, item, doc, sheet) {
  try {
    let connection = doc.connections.find(
      (connection) =>
        connection.parent.item === item.id && connection.sheet === schema.sheet
    );

    let connections = [];

    for (var i = 0; i < doc.connections.length; i++) {
      let conn = doc.connections[i];

      if (conn.parent.item === item.id) break;

      if (conn.parent.sheet === sheet.id && conn.item === connection.item) {
        connections.push(conn);
      }
    }

    let mappedValues = connections.map((conn) => {
      let item = sheet.items.find((item) => item.id === conn.parent.item);

      if (item) {
        return item.values[schema.id];
      } else {
        return [];
      }
    });

    return [].concat.apply([], mappedValues).filter(Boolean);
  } catch (err) {
    console.log(err);
  }
}
