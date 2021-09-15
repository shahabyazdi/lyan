import store from "../redux/store/store";
import getNewConnection from "./getNewConnection";

function overrideToJSON(date) {
  if (!date?.isValid) return;

  date.toJSON = () => date.valueOf();
}

function getState() {
  return store.getState();
}

export default function preValueChange(schema, value, sheetIndex, itemIndex) {
  if (["date", "time"].includes(schema.type)) {
    [].concat(value).forEach(overrideToJSON);
  }

  if (schema.type === "connection sheet item") {
    let { doc } = getState();
    let sheet = doc.sheets[sheetIndex];
    let item = sheet.items[itemIndex];
    let isConnectionAvailble = false;
    let previousValue = item.values[schema.id];

    if (item.temp) {
      doc.connections = doc.connections.filter(
        (connection) => connection.parent.item !== item.id
      );
    }

    doc.connections.forEach((connection) => {
      if (
        connection.parent.item === item.id &&
        connection.parent.sheet === sheet.id &&
        connection.sheet === schema.sheet &&
        connection.item === previousValue
      ) {
        isConnectionAvailble = true;

        connection.item = value;
      }
    });

    if (!isConnectionAvailble) {
      doc.connections.push(
        getNewConnection(item.id, sheet.id, schema.sheet, value)
      );
    }
  }

  if (schema.element === "table" && schema.type === "schema") {
    schema.schemas.forEach((schema, columnIndex) => {
      if (["date", "time"].includes(schema.type)) {
        value.forEach((row) =>
          [].concat(row[columnIndex]).forEach(overrideToJSON)
        );
      }
    });
  }

  return value;
}
