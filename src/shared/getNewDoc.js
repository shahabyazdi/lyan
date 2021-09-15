export default function getNewDoc(
  { mode, template },
  { translate, toLocaleDigits, getId }
) {
  let doc;

  if (mode === "template") {
    let name =
      translate("Template") + "-" + toLocaleDigits(api.getTemplates().length);

    doc = {
      id: getId(),
      name,
      date: Date.now(),
      sheets: [],
      descriptions: "",
      variables: {},
    };
  } else {
    let sheets = template?.sheets || [];

    sheets.forEach((sheet) => (sheet.items = []));

    doc = {
      id: getId(),
      date: Date.now(),
      sheets,
      connections: [],
      variables: template?.variables || {},
      descriptions: "",
    };

    if (template) {
      doc.template = { ...template };

      delete doc.template.sheets;
      delete doc.template.variables;
    }
  }

  return doc;
}
