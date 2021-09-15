export default function getInitialValue(schema) {
  let value = "";

  if (schema.element === "select" && !schema.emptyOption) {
    value = schema.options?.[0]?.[1];
  }

  if (["checkbox", "switch"].includes(schema.type)) value = false;

  return value;
}
