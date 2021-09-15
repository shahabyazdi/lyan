module.exports = function (state) {
  let { itemIndex, sheetIndex, doc, language, settings } = state;

  if (itemIndex !== undefined && sheetIndex !== undefined) {
    let sheet = doc.sheets[sheetIndex];
    let item = sheet.items[itemIndex];

    for (let i = 0; i < sheet.schemas.length; i++) {
      let schema = sheet.schemas[i];
      let value = item.values[schema.id];

      if (
        schema.required &&
        (value === undefined || value === "" || value === [])
      ) {
        return {
          valid: false,
          message: toLocale(schema.name) + translate(" is required"),
        };
      }
    }
  }

  return { valid: true };

  function toLocale(string) {
    let variables = state.doc?.variables?.[settings.language];

    variables = Object.fromEntries(variables || []);

    return variables?.[string] || string;
  }

  function translate(string) {
    return language?.[settings.language]?.[string] || string;
  }
};
