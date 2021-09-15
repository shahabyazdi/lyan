import { useEffect, useState, createElement } from "react";
import Element from "lyan-ui/components/element";
import OperationElement from "./operation_element";
import mustLocalizeValue from "../../../shared/mustLocalizeValue";
import preValueChange from "../../../shared/preValueChange";
import { updateValue } from "../../../redux/actions/actions";
import { useDispatch } from "react-redux";

export default function TableCell({
  schema,
  columnSchema,
  rowIndex,
  columnIndex,
  sheetIndex,
  itemIndex,
  cellValue,
  disabled,
  mixedData,
  itemId,
  toLocaleDigits,
  toEnglishDigits,
}) {
  let [value, setValue] = useState(cellValue);
  let dispatch = useDispatch();
  let isOperation = columnSchema.element === "operation";
  let props = { ...columnSchema };

  useEffect(() => setValue(cellValue), [cellValue]);

  if (schema.mode === "single" && Array.isArray(value)) value = value[0];

  if (isOperation) {
    props = {
      ...props,
      id: schema.id,
      rowIndex: rowIndex,
      columnIndex: columnIndex,
      mixedData: mixedData,
      itemId,
    };
  } else {
    props = {
      ...props,
      onValueChange: handleValueChange,
      onBlur: handleBlur,
      className: "full-width",
      disabled,
    };

    props.value = mustLocalizeValue({ ...columnSchema, value })
      ? toLocaleDigits(value)
      : value || "";
  }

  return createElement(isOperation ? OperationElement : Element, props);

  function handleValueChange(value) {
    value = toEnglishDigits(value);
    value = preValueChange(columnSchema, value, sheetIndex, itemIndex);

    setValue(value);

    if (
      columnSchema.element === "select" ||
      ["date", "time", "week", "month", "year"].includes(columnSchema.type)
    ) {
      update(value);
    }
  }

  function handleBlur() {
    if (
      columnSchema.element !== "select" &&
      !["date", "time", "week", "month", "year"].includes(columnSchema.type)
    ) {
      update(value);
    }
  }

  function update(value) {
    dispatch(
      updateValue(schema, value, sheetIndex, itemIndex, rowIndex, columnIndex)
    );
  }
}
