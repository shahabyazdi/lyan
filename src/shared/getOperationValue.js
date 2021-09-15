import calculate from "./calculate";
import DateObject from "react-date-object";
import {
  create,
  parserDependencies,
  addDependencies,
  divideDependencies,
  bitOrDependencies,
} from "mathjs";

const math = create({
  parserDependencies,
  addDependencies,
  divideDependencies,
  bitOrDependencies,
});

/**
 *
 * @param {object} schema
 * @param {object} values
 * @param {schema[]} options (optional)
 * @returns {string | object}
 */
export default function getOperationValue(
  { formula, id, name, parent, rowIndex, columnIndex },
  values,
  { ignoreConnections = true, schemas = [] } = {}
) {
  const parser = math.parser();

  let val = "";

  parser.set("self", {
    name,
    id,
    parent,
    row: rowIndex,
    column: columnIndex,
  });

  parser.set("getValue", (id, row, column) => {
    let value;

    if (!ignoreConnections && getSchema(id).element === "connection") {
      handleError();
    }

    if (id !== undefined && row !== undefined && column !== undefined) {
      value = values?.[id]?.[row]?.[column];
    } else if (id !== undefined && row !== undefined) {
      value = values?.[id]?.[row];
    } else {
      value = values?.[id];
    }

    if (value?.wait) handleError();
    if (Array.isArray(value)) return "[array]";
    if (value instanceof DateObject) return new DateObject(value);

    return value || 0;
  });

  parser.set("getColumn", (id, column) => {
    return (
      values?.[id]?.map((row) => {
        let value = row[column];

        if (value.wait) handleError();

        return value;
      }) || []
    );
  });

  parser.set("calc", (array, operation) => calculate(array, operation));

  parser.set("isEqual", (arg1, arg2) => arg1 === arg2);

  parser.set("addToDate", (date, duration, type) =>
    new DateObject(date).add(duration, type).format()
  );

  parser.set("isAvailble", (...args) => !args.some((arg) => !arg));

  try {
    return parser.evaluate(formula);
  } catch (err) {
    return val;
  }

  function handleError() {
    val = { wait: true };

    throw new Error("Wait signal received !");
  }

  function getSchema(id) {
    return schemas.find((schema) => schema.id === id);
  }
}
