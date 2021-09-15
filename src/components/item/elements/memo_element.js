import { useEffect, useState, createElement, useMemo } from "react";
import Element from "lyan-ui/components/element";
import TableCell from "./table_cell";
import Options from "lyan-ui/components/options";
import FormGroup from "../../form_group/form_group";
import { IconRowInsertBottom, IconRowInsertTop } from "@tabler/icons";
import getInitialValue from "../../../shared/getInitialValue";
import preValueChange from "../../../shared/preValueChange";
import newOption from "../../../shared/newOption";
import mustLocalizeValue from "../../../shared/mustLocalizeValue";
import { getPageData } from "lyan-ui/components/table_layout";
import { arrayMoveImmutable } from "array-move";
import { updateValue } from "../../../redux/actions/actions";
import { connect } from "react-redux";
import DateObject from "react-date-object";

function MemoElement({
  originalSchema,
  updateValue,
  sheetIndex,
  itemIndex,
  readOnly,
  getId,
  itemId = Object.keys(window.values)[0],
  reportsData = {},
  toLocaleDigits,
  toEnglishDigits,
  translate,
}) {
  let [value, setValue] = useState();
  let [page, setPage] = useState(1);
  let schema = { ...originalSchema };
  let data = useMemo(() => ({}), []);
  let windowValue = window.values?.[itemId]?.[schema.id];

  sheetIndex = reportsData.sheetIndex ?? sheetIndex;
  itemIndex = reportsData.itemIndex ?? itemIndex;

  useEffect(() => {
    data.value = window.values?.[itemId]?.[schema.id];

    setValue(data.value);
    setPage(1);
  }, [schema.id, sheetIndex, itemIndex, schema.layout, data, itemId]);

  useEffect(() => {
    if (windowValue === data.value) return;

    if (data.value?.[0] instanceof DateObject) {
      let dataValue = data.value.map((date) => date.valueOf());

      if (JSON.stringify(dataValue) === JSON.stringify(windowValue)) return;
    }

    setValue(windowValue);
  }, [windowValue, data.value]);

  if (schema.element === "connection") {
    schema = {
      ...window.connections?.[itemId]?.[schema.id],
      digits: schema.digits,
      id: schema.id,
    };

    readOnly = true;
    value = schema.value;

    if (schema.separator) {
      schema.type = "number";
      schema.separator = ",";
    }
  }

  if (!readOnly) readOnly = schema.readOnly;

  if (schema.element === "table") {
    let mustAddRow = Boolean(
      !readOnly && (!schema.rowsLimit || schema.rowsLimit > value.length)
    );

    let mixedValues = (window.mixedValues?.[itemId]?.[schema.id] || []).concat(
      window.values?.[itemId]?.[schema.id] || []
    );

    let [activeRows, pageData] = getPageData({
      rows: mixedValues,
      page,
      rowsPerPage: schema.layout === "table" ? 10 : 1,
    });

    schema = {
      ...schema,
      head: [...schema.schemas],
      newRow: !readOnly,
      onNewRow: newRow,
      page: page,
      setPage: setPage,
      ...pageData,
    };

    if (mustAddRow) schema.head.push({ name: translate("Options") });
    if (schema.counter) schema.head.unshift({ name: translate("Rows") });

    if (schema.layout === "tab") {
      if (activeRows.length > 0) {
        let [{ row, rowIndex }] = activeRows;
        let validRowIndex =
          rowIndex - (window.mixedValues?.[itemId]?.[schema.id] || []).length;

        let options = getOptions(validRowIndex);

        schema.icons = (
          <>
            <Options {...options} /> {getOtherOptions(validRowIndex)}
          </>
        );

        schema.children = getTabBody(row, validRowIndex);
      }
    } else {
      schema.children = getTableBody(activeRows, mustAddRow);
    }
  }

  if (["select", "multi select"].includes(schema.element)) {
    schema.onNewItemRequested = () => {
      newOption(originalSchema.schemaindex, sheetIndex);
    };
  }

  if (schema.element !== "table" && !readOnly) {
    schema.onValueChange = handleValueChange;
    schema.onBlur = handleBlur;
  }

  if (schema.mode === "single" && Array.isArray(value)) value = value[0];

  schema.readOnly = readOnly;
  schema.className = schema.className + " full-width";

  schema.value = mustLocalizeValue({ ...schema, value })
    ? toLocaleDigits(value)
    : value || "";

  [
    //select props
    "itemFormat",
    "mixItems",

    //table props
    "schemas",
    "counter",
    "rowsLimit",
    "mix",

    //global props
    "moveup",
    "movedown",

    //others
    "itemName",
  ].forEach((prop) => delete schema[prop]);

  return createElement(Element, schema);

  function handleValueChange(value) {
    value = toEnglishDigits(value);
    value = preValueChange(originalSchema, value, sheetIndex, itemIndex);

    setValue(value);

    if (
      ["select", "table"].includes(schema.element) ||
      ["date", "time", "week", "month", "year"].includes(schema.type)
    ) {
      data.value = value;

      updateValue(originalSchema, value, sheetIndex, itemIndex);
    }
  }

  function handleBlur() {
    if (
      !["select", "table"].includes(schema.element) &&
      !["date", "time", "week", "month", "year"].includes(schema.type)
    ) {
      if (schema.type === "number") value = Number(value);

      data.value = value;

      updateValue(originalSchema, value, sheetIndex, itemIndex);
    }
  }

  function getNewRow() {
    return originalSchema.schemas.map((schema) => getInitialValue(schema));
  }

  function newRow() {
    if (readOnly) return;

    const value = window.values?.[itemId]?.[schema.id] || [];
    const newArray = [...value];

    newArray.splice(newArray.length, 0, getNewRow());

    handleValueChange(newArray);
  }

  function deleteRow(rowIndex) {
    if (rowIndex < 0 || readOnly) return;

    handleValueChange(
      window.values?.[itemId]?.[schema.id].filter(
        (row, index) => index !== rowIndex
      )
    );
  }

  function addRow(rowIndex = window.values?.[itemId]?.[schema.id].length) {
    const newArray = [...window.values?.[itemId]?.[schema.id]];

    newArray.splice(rowIndex, 0, getNewRow());

    handleValueChange?.(newArray);
  }

  function getTableBody(activeRows, mustAddRow) {
    return activeRows.map(({ row, rowIndex }) => {
      let validRowIndex =
        rowIndex - (window.mixedValues?.[itemId]?.[schema.id] || []).length;

      let options = getOptions(validRowIndex);

      return (
        <tr
          key={getId()}
          className={validRowIndex < 0 ? "disabled" : undefined}
        >
          {schema.counter && (
            <td style={{ padding: "0.2em .5em" }}>
              {toLocaleDigits(rowIndex + 1)}
            </td>
          )}
          {schema.schemas.map((columnSchema, columnIndex) => {
            return (
              <td key={columnIndex}>
                <TableCell
                  disabled={validRowIndex < 0 || readOnly}
                  mixedData={{ isMixed: validRowIndex < 0, rowIndex }}
                  schema={schema}
                  columnSchema={columnSchema}
                  columnIndex={columnIndex}
                  rowIndex={validRowIndex}
                  sheetIndex={sheetIndex}
                  itemIndex={itemIndex}
                  itemId={itemId}
                  toLocaleDigits={toLocaleDigits}
                  toEnglishDigits={toEnglishDigits}
                  cellValue={
                    validRowIndex < 0
                      ? row[columnIndex]
                      : window.values?.[itemId]?.[schema.id]?.[validRowIndex]?.[
                          columnIndex
                        ]
                  }
                />
              </td>
            );
          })}
          {mustAddRow && (
            <td
              style={{
                padding: "0.2em",
                minWidth: "8em",
                whiteSpace: "nowrap",
              }}
            >
              <Options {...options} />
              {getOtherOptions(validRowIndex)}
            </td>
          )}
        </tr>
      );
    });
  }

  function getTabBody(row, validRowIndex) {
    return (
      <div style={{ padding: "0.5em" }}>
        {schema.schemas.map((columnSchema, columnIndex) => (
          <FormGroup key={getId()} title={columnSchema.name}>
            <TableCell
              disabled={validRowIndex < 0 || readOnly}
              mixedData={{
                isMixed: validRowIndex < 0,
                rowIndex: validRowIndex,
              }}
              schema={schema}
              columnSchema={columnSchema}
              columnIndex={columnIndex}
              rowIndex={validRowIndex}
              sheetIndex={sheetIndex}
              itemIndex={itemIndex}
              toLocaleDigits={toLocaleDigits}
              toEnglishDigits={toEnglishDigits}
              cellValue={
                validRowIndex < 0
                  ? row[columnIndex]
                  : window.values?.[itemId]?.[schema.id]?.[validRowIndex]?.[
                      columnIndex
                    ]
              }
            />
          </FormGroup>
        ))}
      </div>
    );
  }

  function getOptions(validRowIndex) {
    let options = {
      onDelete: () => deleteRow(validRowIndex),
    };

    if (validRowIndex > 0) {
      options.onMoveUp = () => {
        handleValueChange(
          arrayMoveImmutable(
            window.values?.[itemId]?.[schema.id],
            validRowIndex,
            validRowIndex - 1
          )
        );
      };
    }

    if (validRowIndex >= 0 && validRowIndex < (value || []).length - 1) {
      options.onMoveDown = () => {
        handleValueChange(
          arrayMoveImmutable(
            window.values?.[itemId]?.[schema.id],
            validRowIndex,
            validRowIndex + 1
          )
        );
      };
    }

    return options;
  }

  function getOtherOptions(validRowIndex) {
    return (
      <>
        <IconRowInsertBottom
          className={`lui-option ${
            validRowIndex < 0 ? "lui-option-disable" : ""
          }`}
          onClick={() => {
            if (validRowIndex < 0) return;

            addRow(validRowIndex + 1);
          }}
        />
        <IconRowInsertTop
          className={`lui-option ${
            validRowIndex < 0 ? "lui-option-disable" : ""
          }`}
          onClick={() => {
            if (validRowIndex < 0) return;

            addRow(validRowIndex <= 0 ? 0 : validRowIndex);
          }}
        />
      </>
    );
  }
}

const mapStateToProps = ({
  itemIndex,
  sheetIndex,
  getId,
  toLocaleDigits,
  toEnglishDigits,
  translate,
}) => ({
  sheetIndex,
  itemIndex,
  getId,
  toLocaleDigits,
  toEnglishDigits,
  translate,
});

const mapDispatchToProps = {
  updateValue,
};

export default connect(mapStateToProps, mapDispatchToProps)(MemoElement);
