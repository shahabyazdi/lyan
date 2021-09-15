import React, { useState } from "react";
import Select from "lyan-ui/components/select";
import MultiSelect from "lyan-ui/components/multi_select";
import Acordion from "lyan-ui/components/accordion";
import Section from "lyan-ui/components/section";
import FormGroup from "../form_group/form_group";
import NestedSchemaTable from "./nested_schema_table";
import Items from "./items";
import getAllConnections from "../../shared/getAllConnections";
import categories from "../../shared/categories";
import store from "../../redux/store/store";
import { connect } from "react-redux";
import "./reports.css";

function Reports({ translate, toLocale, language, settings }) {
  const [selectedSheetIndex, setSelectedSheetIndex] = useState();
  const [readOnly, setReadOnly] = useState(true);
  const [selectedItems, setSelecteditems] = useState([]);
  const [selectedSchemas, setSelectedSchemas] = useState([]);
  const [selectedConnections, setSelectedConnections] = useState([]);
  const [selectedConnectionSchemas, setSelectedConnectionSchemas] = useState(
    []
  );
  const doc = store.getState().doc;

  let schemas = doc.sheets[selectedSheetIndex]?.schemas?.map(
    (schema, schemaindex) => ({ ...schema, schemaindex })
  );

  schemas = schemas?.filter?.((schema) => selectedSchemas.includes(schema.id));
  schemas = [...(schemas || [])];

  let items = [];

  doc.sheets[selectedSheetIndex]?.items?.forEach?.((item, index) => {
    if (!selectedItems.includes(item.id)) return;

    items.push({
      ...item,
      index,
      sheetIndex: Number(selectedSheetIndex),
    });
  });

  items = [...items];

  let connections = new Set();

  items.forEach((item) => {
    let [innerConnections, outerConnections] = getAllConnections(
      item.id,
      doc.connections
    );

    item.connections = {};

    innerConnections.forEach((connection) => connections.add(connection.sheet));

    outerConnections.forEach((connection) => {
      connections.add(connection.parent.sheet);

      if (!selectedConnections.includes(connection.parent.sheet)) return;
      //populating connections
      let sheet, sheetIndex;

      for (let i = 0; i < doc.sheets.length; i++) {
        let s = doc.sheets[i];

        if (s.id === connection.parent.sheet) {
          sheet = s;
          sheetIndex = i;
          break;
        }
      }

      if (!item.connections[sheet.id]) item.connections[sheet.id] = [];

      sheet.items.forEach((connectedItem, index) => {
        if (!connectedItem.temp && connectedItem.id === connection.parent.item)
          item.connections[sheet.id].push({
            ...connectedItem,
            index,
            sheetIndex,
          });
      });
    });
  });

  connections = [...connections].map?.((id) =>
    doc.sheets.find((sheet) => sheet.id === id)
  );

  let connectionsData = {};

  connections.forEach((sheet) => {
    if (!selectedConnections.includes(sheet.id)) return;

    let selectedSchemas = sheet.schemas.map((schema, schemaindex) => ({
      ...schema,
      schemaindex,
    }));

    selectedSchemas = selectedSchemas.filter((schema) =>
      selectedConnectionSchemas.includes(schema.id)
    );

    if (selectedSchemas.length === 0) return;

    connectionsData[sheet.id] = {
      schemas: sheet.schemas,
      sheetName: sheet.name,
      selectedSchemas,
    };
  });

  return (
    <div className="reports">
      <Acordion name={translate("Reports")}>
        <div className="display-flex">
          <FormGroup title="Sheet" className="flex-1">
            <Select
              emptyOption
              className="full-width"
              options={doc.sheets.map((sheet, index) => [
                toLocale(sheet.name),
                index,
              ])}
              value={selectedSheetIndex}
              onValueChange={(value) => {
                setSelectedSheetIndex(value);
                setSelecteditems([]);
                setSelectedSchemas([]);
              }}
            />
          </FormGroup>
          <FormGroup title="Schemas" className="flex-1">
            <MultiSelect
              options={getNestedValues(
                categories(doc.sheets[selectedSheetIndex]?.schemas)
              )}
              value={selectedSchemas}
              onValueChange={setSelectedSchemas}
              labels={language[settings.language]}
              digits={settings.digits[settings.digit]}
            />
          </FormGroup>
          <FormGroup title="Mode" className="flex-1">
            <Select
              className="select full-width"
              options={[
                [translate("Read Only"), "readonly"],
                [translate("Editable"), "editable"],
              ]}
              onValueChange={(value) => setReadOnly(value === "readonly")}
            />
          </FormGroup>
        </div>
        <div className="display-flex">
          <FormGroup title="Items" className="flex-1">
            <Items
              selectedSheetIndex={selectedSheetIndex}
              selectedItems={selectedItems}
              setSelecteditems={setSelecteditems}
            />
          </FormGroup>
          <FormGroup title="Connections" className="flex-1">
            <MultiSelect
              options={connections?.map?.((connection) => ({
                text: toLocale(connection.name),
                value: connection.id,
              }))}
              value={selectedConnections}
              onValueChange={setSelectedConnections}
              labels={language[settings.language]}
              digits={settings.digits[settings.digit]}
            />
          </FormGroup>
          <FormGroup title="Connection Schemas" className="flex-1">
            <MultiSelect
              options={connections
                .filter((sheet) => selectedConnections.includes(sheet.id))
                .map((sheet) => ({
                  text: toLocale(sheet.name),
                  value: sheet.id,
                  childs: getNestedValues(categories(sheet.schemas)),
                }))}
              value={selectedConnectionSchemas}
              onValueChange={setSelectedConnectionSchemas}
              labels={language[settings.language]}
              digits={settings.digits[settings.digit]}
            />
          </FormGroup>
        </div>
      </Acordion>
      <Section className="table-container">
        {selectedItems.length > 0 && selectedSchemas.length > 0 && (
          <NestedSchemaTable
            schemas={schemas}
            items={items}
            connectionsData={connectionsData}
            readOnly={readOnly}
            selectedSheetIndex={selectedSheetIndex}
          />
        )}
      </Section>
    </div>
  );

  function getNestedValues(schemas) {
    let list = [];

    for (let schema of schemas.noneGroups) {
      list.push({ text: toLocale(schema.name), value: schema.id });
    }

    for (let schema of schemas.groups) {
      list.push({
        text: toLocale(schema.name),
        value: schema.id,
        childs: getChild(schema.id),
      });
    }

    return list;

    function getChild(id) {
      if (!schemas.inGroups[id]) return;

      let result = [];

      for (let schema of schemas.inGroups[id]) {
        result.push({
          text: toLocale(schema.name),
          value: schema.id,
          childs: getChild(schema.id),
        });
      }

      return result;
    }
  }
}

const mapStateToProps = (state) => ({
  translate: state.translate,
  toLocale: state.toLocale,
  language: state.language,
  settings: state.settings,
});

export default connect(mapStateToProps)(Reports);
