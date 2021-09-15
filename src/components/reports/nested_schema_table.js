import { createElement } from "react";
import MemoElement from "../item/elements/memo_element";
import OperationElement from "../item/elements/operation_element";
import categories from "../../shared/categories";
import collectConnectionElements from "../../shared/collectConnectionElements";
import collectMixedValues from "../../shared/collectMixedValues";
import calculateValues from "../../shared/calculateValues";
import getValidSchema from "../../shared/getValidSchema";
import store from "../../redux/store/store";
import { connect, useSelector } from "react-redux";
import "./nested_schema_table.css";

function NestedSchemaTable({
  schemas,
  items,
  connectionsData,
  readOnly,
  toLocale,
  toLocaleDigits,
  settings,
  getId,
  language,
}) {
  const colspans = {};
  const { groups, inGroups, noneGroups } = categories(schemas);
  const thead = getHead();
  const tbody = getBody();
  const currentState = store.getState();

  window.itemsWithConnection = [];

  items.forEach((item) => getAllValues(item));

  let body = renderBody();

  return (
    <table
      className={`lui-table report ${
        settings.direction === "rtl" ? "lui-rtl" : ""
      }`}
    >
      <thead>{renderHead()}</thead>
      <tbody>{body}</tbody>
    </table>
  );

  function getAllValues(item) {
    let state = {
      ...currentState,
      sheetIndex: item.sheetIndex,
      itemIndex: item.index,
    };

    collectConnectionElements(state);
    collectMixedValues(state);
    calculateValues(state);

    for (let sheetId in item.connections || {}) {
      let connectedItems = item.connections[sheetId];

      connectedItems.forEach((item) => getAllValues(item));
    }
  }

  function renderHead() {
    return thead.trList.map((tr, rowIndex) => (
      <tr key={rowIndex}>
        {tr.map(({ colspan, rowspan, name, width }, columnIndex) => (
          <th
            key={columnIndex}
            colSpan={colspan}
            rowSpan={rowspan || 1}
            style={{ width }}
          >
            {toLocale(name)}
          </th>
        ))}
      </tr>
    ));
  }

  function renderBody() {
    return tbody.trList.map((tr, rowIndex) => (
      <tr key={rowIndex}>
        {tr.map(({ colspan, rowspan, schema, sheetIndex, item }) => {
          let element;

          if (schema) {
            let isOperation = schema.element === "operation";

            let originalSchema = getValidSchema(
              schema,
              currentState.doc,
              settings,
              toLocale,
              toLocaleDigits,
              language
            );

            if (originalSchema.element === "table") {
              originalSchema.counter = false;
              originalSchema.renderHead = false;
              originalSchema.layout = "table";
            }

            let props = {
              reportsData: {
                sheetIndex,
                itemIndex: item.index,
              },
              itemId: item.id,
              readOnly,
            };

            if (isOperation) {
              props = { ...props, ...originalSchema };
            } else {
              props.originalSchema = originalSchema;
            }

            if (schema.element === "connection") {
              window.itemsWithConnection.push(item);

              element = <ConnectionElement {...props} />;
            } else {
              element = createElement(
                isOperation ? OperationElement : MemoElement,
                props
              );
            }
          }

          return (
            <td key={getId()} colSpan={colspan || 1} rowSpan={rowspan}>
              {element}
            </td>
          );
        })}
      </tr>
    ));
  }

  function getHead() {
    const thead = { trList: [] },
      hasChild = (schema) => inGroups?.[schema.id]?.length > 0,
      insertSchema = (schema, rowIndex) => {
        if (!thead.trList[rowIndex]) thead.trList[rowIndex] = [];

        thead.trList[rowIndex].push(schema);
      };

    let maxRowsLengt = getMaxRowsLength(schemas);

    for (let sheetId in connectionsData) {
      let connectionMaxRowsLengt =
        getMaxRowsLength(connectionsData[sheetId].selectedSchemas) + 1;

      if (maxRowsLengt < connectionMaxRowsLengt)
        maxRowsLengt = connectionMaxRowsLengt;
    }

    thead.maxRowsLengt = maxRowsLengt;

    generateHeader(categories(schemas));

    for (let sheetId in connectionsData) {
      let columnIndex = thead.trList[0] ? thead.trList[0].length : 0;

      insertSchema(
        {
          name: connectionsData[sheetId].sheetName,
          colspan: 1,
          rowspan: 1,
        },
        0
      );

      let colspan = generateHeader(
        categories(connectionsData[sheetId].selectedSchemas),
        1
      );

      colspans[sheetId] = colspan;

      if (colspan !== 0) {
        thead.trList[0][columnIndex].colspan = colspan;
      } else {
        thead.trList[0].pop();
      }
    }

    return thead;

    function generateHeader({ noneGroups, groups }, rowIndex = 0) {
      let maxColumns = 0;

      noneGroups.forEach((schema) => {
        if (schema.element === "table") {
          maxColumns += schema.schemas.length;

          insertSchema(
            {
              ...schema,
              colspan: schema.schemas.length + (readOnly ? 0 : 1),
              rowspan: 1,
            },
            rowIndex
          );

          schema.schemas.forEach(($schema, i) => {
            insertSchema(
              {
                ...$schema,
                colspan: 1,
                rowspan: thead.maxRowsLengt - 1,
              },
              rowIndex + 1
            );
          });

          if (!readOnly) {
            maxColumns += 1;
            insertSchema(
              {
                name: "options",
                colspan: 1,
                rowspan: thead.maxRowsLengt - 1,
                width: "94px",
              },
              rowIndex + 1
            );
          }
        } else {
          maxColumns += 1;

          insertSchema(
            { ...schema, colspan: 1, rowspan: thead.maxRowsLengt },
            rowIndex
          );
        }
      });

      groups.forEach((schema) => {
        let index = thead.trList[rowIndex] ? thead.trList[rowIndex].length : 0;

        insertSchema({ ...schema, colspan: 1, rowspan: 1 }, rowIndex);

        let colspan = insertChilds(schema, rowIndex + 1, schemas);
        let rowspan = hasChild(schema) ? 1 : thead.maxRowsLengt - rowIndex;

        maxColumns += colspan;

        thead.trList[rowIndex][index].colspan = colspan;
        thead.trList[rowIndex][index].rowspan = rowspan;
      });

      return maxColumns;
    }

    function insertChilds(schema, rowIndex = 1) {
      let childs = inGroups[schema.id] || [];
      let colspan = 0;

      childs.forEach((schema) => {
        if (isGroup(schema)) {
          let $colspan = insertChilds(schema, rowIndex + 1);

          colspan += $colspan;

          schema.colspan = $colspan;
          schema.rowspan = hasChild(schema) ? 1 : thead.maxRowsLengt - rowIndex;

          insertSchema(schema, rowIndex);
        } else if (schema.element === "table") {
          let $colspan = schema.schemas.length;

          colspan += $colspan;

          schema.colspan = $colspan + (readOnly ? 0 : 1);
          schema.rowspan = 1;

          insertSchema(schema, rowIndex);

          schema.schemas.forEach(($schema, i) => {
            insertSchema(
              {
                ...$schema,
                colspan: 1,
                rowspan: thead.maxRowsLengt - rowIndex - 1,
                width: "150px",
              },
              rowIndex + 1
            );
          });

          if (!readOnly) {
            colspan += 1;

            insertSchema(
              {
                name: "options",
                colspan: 1,
                rowspan: thead.maxRowsLengt - rowIndex - 1,
                width: "150px",
              },
              rowIndex + 1
            );
          }
        } else {
          colspan += 1;

          insertSchema(
            {
              ...schema,
              colspan: 1,
              rowspan: thead.maxRowsLengt - rowIndex,
            },
            rowIndex
          );
        }
      });

      return colspan || 1;
    }

    function getMaxRowsLength() {
      let maxRowsLengt = 0;

      noneGroups.forEach((schema) => {
        if (maxRowsLengt < 1) maxRowsLengt = 1;
        if (schema.element === "table") maxRowsLengt = 2;
      });

      groups.forEach((schema) => {
        let rowsLength = getMaxRows(schema);

        if (maxRowsLengt < rowsLength) maxRowsLengt = rowsLength;
      });

      return maxRowsLengt;

      function getMaxRows(schema, row = 1) {
        let childs = inGroups[schema.id] || [];
        let rowsLength = row;

        childs.forEach((schema) => {
          if (isGroup(schema)) {
            let length = getMaxRows(schema, row + 1);

            if (rowsLength < length) rowsLength = length;
          } else if (schema.element === "table") {
            if (row === rowsLength) {
              rowsLength += 2;
            } else if (rowsLength - row === 1) {
              rowsLength++;
            }
          } else if (row === rowsLength) {
            rowsLength++;
          }
        });

        return rowsLength;
      }
    }
  }

  function getBody() {
    let body = { trList: [] };

    items.forEach(
      (item) => (body.trList = body.trList.concat(getTrList(item)))
    );

    return body;

    function getTrList(item) {
      let trList = [],
        maxRowsLengt = getMaxRowsLength(schemas),
        rowspans = { sheets: {} },
        insertTd = (object, rowIndex) => {
          if (!trList[rowIndex]) trList[rowIndex] = [];

          trList[rowIndex].push(object);
        };

      for (let sheetId in connectionsData) {
        rowspans[sheetId] = [];

        if (!item.connections[sheetId]) continue;

        for (let i = 0; i < item.connections[sheetId].length; i++) {
          let connectionRowsLengt = getMaxRowsLength(
            connectionsData[sheetId].selectedSchemas
          );

          rowspans[sheetId].push(connectionRowsLengt);
        }

        let connectionMaxRowsLengt = rowspans[sheetId].reduce((j, k) => j + k);

        rowspans.sheets[sheetId] = connectionMaxRowsLengt;

        if (maxRowsLengt < connectionMaxRowsLengt) {
          maxRowsLengt = connectionMaxRowsLengt;
        }
      }

      rowspans.max = maxRowsLengt;

      generateItemsData(categories(schemas), undefined, item);

      for (let sheetId in connectionsData) {
        let row = 0;

        if (!item.connections[sheetId]) {
          insertTd(
            {
              rowspan: rowspans.max,
              colspan: colspans[sheetId],
            },
            row
          );

          continue;
        }

        for (let i = 0; i < item.connections[sheetId].length; i++) {
          let connection = item.connections[sheetId][i];

          maxRowsLengt = rowspans[sheetId][i];

          /**
           * if we are in last row of current connection &
           * max rows length of this sheet is less than the biggest rowspan
           * we must strech current row.
           */
          if (
            i === item.connections[sheetId].length - 1 &&
            rowspans.sheets[sheetId] < rowspans.max
          ) {
            maxRowsLengt += rowspans.max - rowspans.sheets[sheetId];
          }

          generateItemsData(
            categories(connectionsData[sheetId].selectedSchemas),
            row,
            connection
          );

          row += maxRowsLengt;
        }
      }

      return trList;

      function getMaxRowsLength(schemas = []) {
        for (let schema of schemas) {
          if (!isGroup(schema)) return 1;
        }

        return 0;
      }

      function generateItemsData(schemas, row = 0, item) {
        schemas.noneGroups.forEach((schema) => insertValue(schema, row, item));

        schemas.groups.forEach((schema) =>
          insertChildsValue(schema, row, schemas, item)
        );
      }

      function insertValue(schema, row, item) {
        let colspan;

        if (schema?.element === "table") {
          colspan = schema.schemas.length + (readOnly ? 0 : 1);
        }

        insertTd(
          {
            rowspan: maxRowsLengt,
            colspan,
            schema,
            itemIndex: item?.index,
            item: item,
            sheetIndex: item?.sheetIndex,
          },
          row
        );
      }

      function insertChildsValue(schema, row = 0, schemas, item) {
        let childs = schemas.inGroups[schema.id] || [];

        if (childs.length === 0) return insertValue();

        childs.forEach((schema) => {
          if (isGroup(schema)) {
            return insertChildsValue(schema, row, schemas, item);
          }

          insertValue(schema, row, item);
        });
      }
    }
  }

  function isGroup(schema) {
    return schema.element === "group" || schema.type === "group";
  }
}

const mapStateToProps = ({
  toLocale,
  settings,
  getId,
  toLocaleDigits,
  language,
}) => ({
  toLocale,
  toLocaleDigits,
  settings,
  getId,
  language,
  /**just for forcing the component to refresh if the schemas change */
  toggleRefresh: window.schemas,
});

export default connect(mapStateToProps)(NestedSchemaTable);

function ConnectionElement({ ...props }) {
  //just for rerendering the component in every file changes
  const doc = useSelector(({ doc }) => doc);

  return <MemoElement {...props} doc={doc} />;
}
