export default function categories(schemas) {
  let groups = [],
    inGroups = [],
    noneGroups = [],
    scripts = [];

  if (!schemas) return { groups, inGroups, noneGroups, scripts };

  for (let schemaindex = 0; schemaindex < schemas.length; schemaindex++) {
    let schema = { ...schemas[schemaindex] };

    if (schema.schemaindex === undefined) schema.schemaindex = schemaindex;
    if (schema.temp) continue;

    if (schema.group) {
      if (!inGroups[schema.group]) {
        inGroups[schema.group] = [schema];
      } else {
        inGroups[schema.group].push(schema);
      }

      continue;
    }

    if (
      (schema.element === "group" || schema.type === "group") &&
      !schema.group
    ) {
      groups.push(schema);

      continue;
    }

    if (schema.type === "script") {
      scripts.push(schema);

      continue;
    }

    noneGroups.push(schema);
  }

  noneGroups.forEach((schema) => {
    schema.moveup = schema.schemaindex !== 0;
    schema.movedown = schema.schemaindex !== noneGroups.length - 1;
  });

  groups.forEach((schema, index) => {
    schema.moveup = index !== 0;
    schema.movedown = index !== groups.length - 1;

    let elements = (inGroups[schema.id] || []).filter(
      (schema) => schema.element !== "group" && schema.type !== "group"
    );

    elements.forEach((schema, index) => {
      schema.moveup = index !== 0;
      schema.movedown = index !== elements.length - 1;
    });
  });

  for (let id in inGroups) {
    let allNestedGroups = inGroups[id].filter(
      (schema) => schema.element === "group" || schema.type === "group"
    );

    allNestedGroups.forEach((item) => {
      let parent = schemas.find((schema) => schema.id === item.group);

      if (!parent) return;

      let groupsInParent = inGroups[parent.id].filter(
        (schema) => schema.element === "group" || schema.type === "group"
      );

      groupsInParent.forEach((schema, index) => {
        schema.moveup = index !== 0;
        schema.movedown = index !== groupsInParent.length - 1;
      });

      let elements = (inGroups[item.id] || []).filter(
        (schema) => schema.element !== "group" && schema.type !== "group"
      );

      elements.forEach((schema, index) => {
        schema.moveup = index !== 0;
        schema.movedown = index !== elements.length - 1;
      });
    });
  }

  return { groups, inGroups, noneGroups, scripts };
}
