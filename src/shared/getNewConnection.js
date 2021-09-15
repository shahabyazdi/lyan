import { ObjectID } from "bson";

export default function getNewConnection(
  itemId,
  sheetId,
  connectedSheet,
  connectedItem
) {
  return {
    id: new ObjectID().toHexString(),
    parent: {
      item: itemId,
      sheet: sheetId,
    },
    date: Date.now(),
    sheet: connectedSheet,
    item: connectedItem,
    descriptions: "",
  };
}
