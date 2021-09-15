import getOperationValue from "./getOperationValue";

export default function getAllOperationValues(
  windowValues,
  schemas,
  windowMixedValues
) {
  let operationSchemas = [];

  schemas.forEach((originalSchema) => {
    let schema = { ...originalSchema };

    if (schema.element === "operation") {
      windowValues[schema.id] = { wait: true };

      operationSchemas.push(schema);
    } else if (
      schema.element === "table" &&
      (schema.schemas.some((schema) => schema.element === "operation") ||
        schema.mix)
    ) {
      let operations = [];
      let value = (windowMixedValues?.[schema.id] || []).concat(
        windowValues[schema.id] || []
      );

      schema.schemas.forEach((schema, index) => {
        if (schema.element === "operation") operations.push(index);
      });

      value = value.map((row) =>
        row.map((column, columnIndex) =>
          operations.includes(columnIndex) ? { wait: true } : column
        )
      );

      windowValues[schema.id] = value;
      operationSchemas.push(schema);
    }
  });

  let mustCalculate = true,
    skipedSchemas;

  while (mustCalculate && operationSchemas.length > 0) {
    mustCalculate = false;
    skipedSchemas = [];

    for (let i = 0; i < operationSchemas.length; i++) {
      let schema = { ...operationSchemas[i] };

      if (schema.element === "operation") {
        let value = getOperationValue(schema, windowValues);

        if (value?.wait) {
          skipedSchemas.push(schema);
        } else {
          windowValues[schema.id] = value;
          mustCalculate = true;
        }
      } else if (schema.element === "table") {
        let rows = windowValues[schema.id];

        for (
          let columnIndex = 0;
          columnIndex < schema.schemas.length;
          columnIndex++
        ) {
          let columnSchema = { ...schema.schemas[columnIndex] };
          let mustBreak = false;

          if (mustBreak) break;

          if (
            columnSchema.element === "operation" &&
            rows[0]?.[columnIndex]?.wait
          ) {
            columnSchema.parent = schema.id;

            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
              columnSchema.rowIndex = rowIndex;
              columnSchema.columnIndex = columnIndex;

              let value = getOperationValue(columnSchema, windowValues);

              if (value?.wait) {
                skipedSchemas.push(schema);
                mustBreak = true;
                break;
              } else {
                windowValues[schema.id][rowIndex][columnIndex] = value;
                mustCalculate = true;
              }
            }
          }
        }
      }
    }

    operationSchemas = [...skipedSchemas];
  }

  return windowValues;
}
