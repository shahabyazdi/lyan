import { useState } from "react";
import FormGroup from "../form_group/form_group";
import Input from "lyan-ui/components/form_control";
import Select from "lyan-ui/components/select";
import MultiSelect from "lyan-ui/components/multi_select";
import FormulaContainer from "./formula_container";
import TableColums from "./table_columns";
import { connect } from "react-redux";
import { BlankSchema } from "./schema";
import "./more-options.css";

function MoreOptions({
  sheetIndex,
  index,
  doc,
  schema,
  setSchema,
  columnIndex,
  itemIndex,
  translate,
  parentSheet,
  settings,
  language,
  toLocale,
  toLocaleDigits,
}) {
  const [text, setText] = useState("");
  const [value, setValue] = useState("");

  const direction = (
    <FormGroup title="Direction" className="flex-1">
      <Select
        className="full-width"
        element="select"
        type="manual"
        emptyOption
        options={translateOptions([
          ["Default", ""],
          ["Left To Right", "ltr"],
          ["Right To Left", "rtl"],
        ])}
        value={schema.direction}
        onValueChange={(value) => update("direction", value)}
      />
    </FormGroup>
  );

  switch (schema.element + " " + schema.type) {
    case "input number":
      return (
        <>
          <div className="display-flex">
            <FormGroup title="Thousand Separator" className="flex-1">
              <Select
                className="full-width"
                element="select"
                type="manual"
                options={translateOptions([
                  ["Off", "on"],
                  ["On", "off"],
                ])}
                value={schema.separator ? "on" : "off"}
                onValueChange={(value) => update("separator", value === "on")}
              />
            </FormGroup>
            {direction}
          </div>
          {columnIndex !== undefined &&
            ((schema.element === "input" && schema.type === "number") ||
              (schema.element === "operation" &&
                !["condition", "button", "script"].includes(schema.type))) && (
              <Total name="total" value={schema?.total} />
            )}
        </>
      );
    case "input date":
      return (
        <div>
          <div className="display-flex">
            <FormGroup title="Time Picker" className="flex-1">
              <Select
                className="full-width"
                type="manual"
                options={translateOptions([
                  ["Disable", "disable"],
                  ["Enable", "enable"],
                ])}
                value={schema?.timePicker ? "enable" : "disable"}
                onValueChange={(value) =>
                  update("timePicker", value === "enable")
                }
              />
            </FormGroup>

            <FormGroup title="Mode" className="flex-1">
              <Select
                className="full-width"
                type="manual"
                options={translateOptions([
                  ["Single", "single"],
                  ["Multiple", "multiple"],
                  ["Range", "range"],
                ])}
                value={schema?.mode || "single"}
                onValueChange={(value) => update("mode", value)}
              />
            </FormGroup>
          </div>
          {direction}
        </div>
      );
    case "input code editor":
      return (
        <div className="display-flex">
          <FormGroup title="Language" className="flex-1">
            <Select
              className="full-width"
              type="manual"
              value={schema?.language}
              options={translateOptions([
                ["JAVASCRIPT", "js"],
                ["JSX", "jsx"],
                ["HTML", "html"],
                ["XML", "xml"],
                ["CSS", "css"],
                ["SVG", "svg"],
              ])}
              onValueChange={(value) => update("language", value)}
            />
          </FormGroup>
          {direction}
        </div>
      );
    case "select manual":
    case "multi select manual":
      return (
        <div>
          <FormGroup title="Options">
            <div className="display-flex">
              <FormGroup title="Text" className="flex-1">
                <Input
                  className="full-width"
                  type="text"
                  value={text}
                  onValueChange={(value) => setText(value)}
                />
              </FormGroup>
              <FormGroup title="Value" className="flex-1">
                <Input
                  className="full-width"
                  type="text"
                  value={value}
                  onValueChange={(value) => setValue(value)}
                />
              </FormGroup>
            </div>
            <button
              className="float-right"
              onClick={() => {
                if (text === "") return;

                schema.options.push([text, value]);

                update();

                setText("");
                setValue("");
              }}
            >
              +
            </button>
            <div
              key={index}
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-evenly",
              }}
            >
              {schema.options.map((option, index) => (
                <div key={index} style={{ display: "inline-flex" }}>
                  <Input
                    className="select-option-text"
                    value={option[0] || ""}
                    onValueChange={(value) => {
                      schema.options[index][0] = value;

                      update();
                    }}
                  />
                  :
                  <Input
                    className="select-option-value"
                    value={option[1] || ""}
                    onValueChange={(value) => {
                      schema.options[index][1] = value;

                      update();
                    }}
                  />
                  <span
                    className="select-option-remove"
                    onClick={() => {
                      schema.options = schema.options.filter(
                        (v, i) => i !== index
                      );

                      update();
                    }}
                  >
                    x
                  </span>
                </div>
              ))}
            </div>
          </FormGroup>
          {schema.element === "select" && (
            <FormGroup title="Empty Options">{EmptyOptions()}</FormGroup>
          )}
          <FormGroup title="Allow More Options">
            <Select
              className="full-width"
              type="manual"
              options={translateOptions([
                ["Deny", "deny"],
                ["Allow", "allow"],
              ])}
              value={schema?.allowMoreOptions ? "allow" : "deny"}
              onValueChange={(value) =>
                update("allowMoreOptions", value === "allow")
              }
            />
          </FormGroup>
        </div>
      );
    case "select sheet item":
    case "select connection sheet item":
    case "multi select sheet item":
      let options = doc.sheets
        .filter((sheet) => sheet.id !== parentSheet?.id)
        .map((sheet) =>
          schema.mixItems
            ? { text: toLocaleDigits(toLocale(sheet.name)), value: sheet.id }
            : [toLocaleDigits(toLocale(sheet.name)), sheet.id]
        );

      let sheetSchema = {
        type: "manual",
        options,
        value: schema.mixItems ? schema.sheets : schema.sheet,
      };

      if (!schema.mixItems && !schema.sheet && options.length > 0)
        schema.sheet = options[0][1];

      return (
        <div>
          <div className="display-flex">
            <FormGroup title="Allow More Options" className="flex-1">
              <Select
                className="full-width"
                type="manual"
                options={translateOptions([
                  ["Deny", "deny"],
                  ["Allow", "allow"],
                ])}
                value={schema.allowMoreOptions ? "allow" : "deny"}
                onValueChange={(value) =>
                  update("allowMoreOptions", value === "allow")
                }
              />
            </FormGroup>
            {schema.type === "sheet item" && (
              <FormGroup title="Mix" className="flex-1">
                <Select
                  className="full-width"
                  type="manual"
                  options={translateOptions([
                    ["Off", "on"],
                    ["On", "off"],
                  ])}
                  value={schema.mixItems ? "on" : "off"}
                  onValueChange={(value) => update("mixItems", value === "on")}
                />
              </FormGroup>
            )}
          </div>
          <div className="display-flex">
            {schema.element === "select" && (
              <FormGroup title="Empty Options" className="flex-1">
                {EmptyOptions()}
              </FormGroup>
            )}
            {schema.mixItems && (
              <FormGroup title="Item Format" className="flex-1">
                <Select
                  className="full-width"
                  type="manual"
                  options={translateOptions([
                    ["Item Name", "item"],
                    ["Sheet Name: Item Name", "sheetItem"],
                  ])}
                  value={schema.itemFormat}
                  onValueChange={(value) => update("itemFormat", value)}
                />
              </FormGroup>
            )}
          </div>
          <div className="display-flex">
            <FormGroup
              title={schema.mixItems ? "Sheets" : "Sheet"}
              className="flex-1"
            >
              {schema.mixItems ? (
                <MultiSelect
                  {...sheetSchema}
                  className="full-width"
                  onValueChange={(values) => {
                    update("sheets", values);
                  }}
                  labels={language[settings.language]}
                  digits={settings.digits[settings.digit]}
                />
              ) : (
                <Select
                  {...sheetSchema}
                  className="full-width"
                  onChange={(e) => update("sheet", e.target.value)}
                />
              )}
            </FormGroup>
          </div>
        </div>
      );
    case "operation sum":
    case "operation minus":
    case "operation multiply":
    case "operation devide":
    case "operation minimum":
    case "operation maximum":
    case "operation average":
    case "operation formula":
      return (
        <div>
          <div className="display-flex">
            <FormGroup title="Thousand Separator" className="flex-1">
              <Select
                className="full-width"
                element="select"
                type="manual"
                options={translateOptions([
                  ["Off", "on"],
                  ["On", "off"],
                ])}
                value={schema.separator ? "on" : "off"}
                onValueChange={(value) => update("separator", value === "on")}
              />
            </FormGroup>
            {direction}
          </div>
          <FormGroup title="Formula">
            {/* <FormulaContainer
              schema={schema}
              setSchema={setSchema}
              columnIndex={columnIndex}
            /> */}
            <Input
              type="code editor"
              className="input full-width"
              value={schema.formula}
              onValueChange={(value) => update("formula", value)}
            />
          </FormGroup>
          {columnIndex !== undefined &&
            ((schema.element === "input" && schema.type === "number") ||
              (schema.element === "operation" &&
                !["condition", "button", "script"].includes(schema.type))) && (
              <Total value={schema.total} />
            )}
        </div>
      );
    case "operation condition":
      return (
        <>
          <FormGroup title="Error Replacement">
            <Input
              className="full-width"
              type="text"
              value={schema.errorReplacement || ""}
              onValueChange={(value) => update("errorReplacement", value)}
            />
          </FormGroup>
          <FormGroup title="Formula">
            <Input
              className="full-width"
              type="textarea"
              value={schema.formula || ""}
              rows="5"
              onValueChange={(value) => update("formula", value)}
              style={{ direction: "ltr" }}
            />
          </FormGroup>
        </>
      );
    case "operation button":
    case "operation script":
      return (
        <FormGroup title={schema.type === "button" ? "On Click" : "On Load"}>
          <Input
            className="full-width"
            type="code editor"
            value={schema.onClick || schema.onLoad || ""}
            language="js"
            onValueChange={(value) => {
              update(schema.type === "button" ? "onClick" : "onLoad", value);
            }}
          />
        </FormGroup>
      );
    case "connection element":
      let sheets = doc.sheets,
        mapedSheets = sheets
          .map(
            (sheet) =>
              sheet.id !== doc.sheets[sheetIndex].id && [sheet.name, sheet.id]
          )
          .filter((sheet) => sheet !== false),
        connectedSheet = schema?.connectedSheet || mapedSheets?.[0]?.[1] || "",
        selectedSheet = sheets.find((sheet) => sheet.id === connectedSheet),
        schemas = selectedSheet?.schemas?.map?.((schema) => [
          schema.name,
          schema.id,
        ]),
        connectedElement = schema.connectedElement || schemas?.[0]?.[1] || "";

      schema.connectedSheet = connectedSheet;
      schema.connectedElement = connectedElement;

      return (
        <div className="display-flex">
          <FormGroup title="Select Connected Sheet" className="flex-1">
            <Select
              className="full-width"
              type="manual"
              options={mapedSheets}
              value={connectedSheet}
              onValueChange={(connectedSheet) => {
                let selectedSheet = sheets.find(
                    (sheet) => sheet.id === connectedSheet
                  ),
                  schemas = selectedSheet?.schemas?.map?.((schema) => [
                    schema.name,
                    schema.id,
                  ]),
                  connectedElement = schemas?.[0]?.[1];

                update({
                  connectedSheet,
                  connectedElement,
                });
              }}
            />
          </FormGroup>
          <FormGroup title="Select Connected Element" className="flex-1">
            <Select
              className="full-width"
              type="manual"
              options={schemas}
              value={connectedElement}
              onValueChange={(value) => update("connectedElement", value)}
            />
          </FormGroup>
        </div>
      );
    case "table manual":
    case "table schema":
      let columnNumber = schema.schemas.length,
        connections = [];

      if (schema.mix) {
        let item = doc.sheets?.[sheetIndex]?.items?.[itemIndex];

        connections = doc?.connections
          ?.filter?.((connection) => connection.parent.item === item.id)
          ?.map?.((connection) => {
            let sheet = doc.sheets.find(
              (sheet) => sheet.id === connection.sheet
            );

            return sheet ? [sheet.name, sheet.id] : null;
          })
          ?.filter?.((item) => item !== null);
      }

      return (
        <div>
          <div className="display-flex">
            <FormGroup title="Mix" className="flex-1">
              <Select
                className="full-width"
                type="manual"
                options={translateOptions([
                  ["Off", "on"],
                  ["On", "off"],
                ])}
                value={schema.mix ? "on" : "off"}
                onValueChange={(value) => update("mix", value === "on")}
              />
            </FormGroup>
            {schema.mix && (
              <FormGroup title="Select Connection" className="flex-1">
                <Select
                  className="full-width"
                  type="manual"
                  options={connections}
                  emptyOption={true}
                  value={schema.sheet}
                  onValueChange={(value) => update("sheet", value)}
                />
              </FormGroup>
            )}
          </div>
          <div className="display-flex">
            <FormGroup title="Rows Limit Number" className="flex-1">
              <Input
                name="limit"
                className="full-width"
                type="number"
                value={schema.rowsLimit}
                onChange={(value) => {
                  value = Number(value);

                  if (value >= 0) update("rowsLimit", value);
                }}
              />
            </FormGroup>
          </div>
          <div className="display-flex">
            <FormGroup title="Columns" className="flex-1">
              <div className="display-flex">
                <Input
                  type="number"
                  name="columns"
                  className="flex-1"
                  value={columnNumber}
                  readOnly
                />
                <button
                  onClick={() => {
                    let name = translate("column") + "-" + (columnNumber + 1);

                    schema.schemas.push(
                      schema.type === "manual"
                        ? {
                            align: "left",
                            name,
                          }
                        : new BlankSchema("input", "text", name)
                    );

                    update();
                  }}
                >
                  +
                </button>
              </div>
            </FormGroup>
            {schema.layout !== "tab" && (
              <FormGroup title="Row Counter" className="flex-1">
                <Select
                  className="full-width"
                  type="manual"
                  options={translateOptions([
                    ["Off", "on"],
                    ["On", "off"],
                  ])}
                  value={schema.counter ? "on" : "off"}
                  onValueChange={(value) => update("counter", value === "on")}
                />
              </FormGroup>
            )}
          </div>
          {<TableColums schema={schema} setSchema={setSchema} />}
        </div>
      );
    case "group fieldset":
    case "group accordion":
      return (
        <div>
          <FormGroup title="Default Collapse">
            <Select
              className={"full-width"}
              type={"manual"}
              options={translateOptions([
                ["Off", "on"],
                ["On", "off"],
              ])}
              value={schema.collapse ? "on" : "off"}
              onValueChange={(value) => update("collapse", value === "on")}
            />
          </FormGroup>
          <FormGroup title="Elements">
            <FormulaContainer
              schema={schema}
              setSchema={setSchema}
              columnIndex={columnIndex}
            />
          </FormGroup>
        </div>
      );
    case "group float modal":
      return (
        <div>
          <div className="display-flex">
            <FormGroup title="Width" className="flex-1">
              <Select
                className="full-width"
                type="manual"
                options={[
                  ["70%", "70"],
                  ["60%", "60"],
                  ["50%", "50"],
                  ["40%", "40"],
                  ["30%", "30"],
                ]}
                value={schema.width || "70"}
                onValueChange={(value) => update("width", value)}
              />
            </FormGroup>
            <FormGroup title="Remove Panel On Hide" className="flex-1">
              <Select
                className="full-width"
                type="manual"
                options={[
                  ["Disable", "disable"],
                  ["Enable", "enable"],
                ]}
                value={schema.removePanelOnHide ? "enable" : "disable"}
                onValueChange={(value) =>
                  update("removePanelOnHide", value === "enable")
                }
              />
            </FormGroup>
          </div>
          <FormGroup title="Elements">
            <FormulaContainer
              schema={schema}
              setSchema={setSchema}
              columnIndex={columnIndex}
            />
          </FormGroup>
        </div>
      );
    case "group container":
      return (
        <div>
          <div className="display-flex">
            <FormGroup title="Display" className="flex-1">
              <Select
                className={"full-width"}
                type={"manual"}
                options={translateOptions([
                  ["Horizontal", "horizontal"],
                  ["Vertical", "vertical"],
                ])}
                value={schema.display || "horizontal"}
                onValueChange={(value) => update("display", value)}
              />
            </FormGroup>
            <FormGroup title="Border" className="flex-1">
              <Select
                className="full-width"
                type="manual"
                options={translateOptions([
                  ["Off", "off"],
                  ["On", "on"],
                ])}
                value={schema.border ? "on" : "off"}
                onValueChange={(value) => update("border", value === "on")}
              />
            </FormGroup>
          </div>
          <FormGroup title="Elements" className="flex-1">
            <FormulaContainer
              schema={schema}
              setSchema={setSchema}
              columnIndex={columnIndex}
            />
          </FormGroup>
        </div>
      );
    case "custom element":
    case "custom group":
      return (
        <div>
          <FormGroup title="HTML">
            <Input
              className="full-width"
              type="code editor"
              value={schema.html}
              language="html"
              style={{ direction: "ltr" }}
              onValueChange={(value) => update("html", value)}
            />
          </FormGroup>
          <FormGroup title="CSS">
            <Input
              className="full-width"
              type="code editor"
              value={schema.css}
              language="css"
              style={{ direction: "ltr" }}
              onValueChange={(value) => update("css", value)}
            />
          </FormGroup>
          <FormGroup title="SCRIPT">
            <Input
              className="full-width"
              type="code editor"
              value={schema.script}
              language="js"
              style={{ direction: "ltr" }}
              onValueChange={(value) => update("script", value)}
            />
          </FormGroup>
          {schema.type === "group" && (
            <FormGroup title="Elements" className="flex-1">
              <FormulaContainer
                schema={schema}
                setSchema={setSchema}
                columnIndex={columnIndex}
              />
            </FormGroup>
          )}
        </div>
      );
    default:
      if (schema.element === "input") return direction;

      return null;
  }

  function update(key, value) {
    if (key) {
      if (key.constructor === Object) {
        schema = { ...schema, ...key };
      } else {
        schema[key] = value;
      }
    }

    setSchema(schema);
  }

  function EmptyOptions() {
    return (
      <Select
        className="full-width"
        type="manual"
        options={translateOptions([
          ["On", "on"],
          ["Off", "off"],
        ])}
        value={schema.emptyOption ? "on" : "off"}
        emptyOption={false}
        onValueChange={(value) => update("emptyOption", value === "on")}
      />
    );
  }

  function Total({ value }) {
    return (
      <FormGroup title="Total" className="flex-1">
        <Select
          className="full-width"
          type="manual"
          emptyOption
          options={translateOptions([
            ["Sum", "sum"],
            ["Minus", "minus"],
            ["Multiply", "multiply"],
            ["Devide", "devide"],
            ["Average", "average"],
            ["Minimum", "minimum"],
            ["Maximum", "maximum"],
          ])}
          value={value}
          onValueChange={(value) => update("total", value)}
        />
      </FormGroup>
    );
  }

  function translateOptions(options) {
    return options.map(([text, value]) => [translate(text), value]);
  }
}

const mapStateToProps = (state) => ({
  doc: state.doc,
  sheetIndex: state.sheetIndex,
  itemIndex: state.itemIndex,
  translate: state.translate,
  settings: state.settings,
  language: state.language,
  toLocale: state.toLocale,
  toLocaleDigits: state.toLocaleDigits,
});

export default connect(mapStateToProps)(MoreOptions);
