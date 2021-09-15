export default function getItemName(item, sheet, doc) {
  if (!item) return "no item passed as argument";
  if (typeof item.name === "string") return item.name;

  return Object.keys(item.name)
    .map((key) => {
      let schema = sheet?.schemas?.find?.((schema) => schema.id === key);
      let value = item.values[key];

      if (["connection sheet item", "sheet item"].includes(schema?.type)) {
        let sheet = doc.sheets.find((sheet) => sheet.id === schema.sheet);
        let item = sheet.items.find((item) => item.id === value);

        return getItemName(item, sheet, doc);
      }

      return item.name[key];
    })
    .join(" ");
}
