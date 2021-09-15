import React, { useState } from "react";
import MoreOptions from "./more_options";
import FormGroup from "../form_group/form_group";
import Select from "../elements/select/select";
import { connect } from "react-redux";

const defaultNames = [
  ["INPUT", "input"],
  ["SELECT", "select"],
  ["MULTI_SELECT", "multi select"],
  ["OPERATION", "operation"],
  ["CONNECTION", "connection"],
  ["TABLE", "table"],
  ["GROUP", "group"],
  ["CUSTOM", "custom"],
];

function NewElement({
  elementNames,
  childName = "",
  sheet,
  schema,
  isTable,
  translate,
  toLocaleDigits,
}) {
  const [names] = useState(elementNames || defaultNames);
  const [name, setName] = useState(schema?.element || names[0][1]);

  const [types, setTypes] = useState(getElementTypes(name));
  const [type, setType] = useState(schema?.type || types[0][1]);

  const [tableLayout, setTableLayout] = useState(schema?.layout || "table");

  return (
    <div>
      <div className="display-flex">
        <FormGroup title="ELEMENT" className="flex-1">
          <Select
            schema={{
              type: "manual",
              _id: `${childName + "element"}`,
              value: name,
              options: names,
            }}
            disabled={schema ? true : false}
            onChange={(object) => {
              if (object.target) {
                let types = getElementTypes(object.value);

                setName(object.value);
                setTypes(types);
                setType(types[0][1]);
              }
            }}
          />
        </FormGroup>
        <FormGroup title="TYPE" className="flex-1">
          <Select
            schema={{
              type: "manual",
              _id: `${childName + "type"}`,
              value: type,
              options: types,
            }}
            onChange={(object) => {
              if (object.target) setType(object.value);
            }}
            disabled={schema ? true : false}
          />
        </FormGroup>
      </div>
      <div className="display-flex">
        <FormGroup title="NAME" className="flex-1">
          <input
            type="text"
            name={`${childName + "name"}`}
            defaultValue={
              schema?.name ||
              (childName
                ? toLocaleDigits(
                    childName
                      .replace(
                        "child",
                        isTable ? translate("COLUMN") : translate("ELEMENT")
                      )
                      .replace(/-/g, " ")
                      .trim()
                  )
                : "")
            }
            className="input full-width"
          />
        </FormGroup>
        {!["operation", "table", "group"].includes(name) &&
        !["group", "script", "button"].includes(type) ? (
          <FormGroup title="REQUIRED" className="flex-1">
            <Select
              schema={{
                type: "manual",
                _id: `${childName + "required"}`,
                value: schema?.required || "",
                options: [
                  ["FALSE", "false"],
                  ["TRUE", "true"],
                ],
              }}
            />
          </FormGroup>
        ) : (
          name === "table" && (
            <FormGroup title="LAYOUT" className="flex-1">
              <Select
                schema={{
                  type: "manual",
                  _id: `${childName + "layout"}`,
                  options: [
                    ["TABLE", "table"],
                    ["TAB", "tab"],
                  ],
                  value: tableLayout,
                }}
                onChange={(object) => {
                  if (object.target) setTableLayout(object.value);
                }}
              />
            </FormGroup>
          )
        )}
      </div>
      {
        <MoreOptions
          elementName={name}
          elementType={type}
          childName={childName}
          sheet={sheet}
          schema={schema}
          tableLayout={tableLayout}
          isTable={isTable}
        />
      }
    </div>
  );
}

function getElementTypes(elementName) {
  let array = undefined;

  switch (elementName) {
    case "input":
      array = [
        "TEXT",
        "NUMBER",
        "DATE",
        "TIME",
        "CHECKBOX",
        "SWITCH",
        "TEXTAREA",
        "CODE_EDITOR",
      ];
      break;
    case "select":
      array = ["MANUAL", "SHEET_ITEM", "CONNECTION_SHEET_ITEM"];
      break;
    case "multi select":
      array = ["MANUAL", "SHEET_ITEM"];
      break;
    case "operation":
      array = [
        "SUM",
        "MINUS",
        "MULTIPLY",
        "DEVIDE",
        "AVERAGE",
        "MINIMUM",
        "MAXIMUM",
        "FORMULA",
        "CONDITION",
        "BUTTON",
        "SCRIPT",
      ];
      break;
    case "connection":
      array = ["ELEMENT"];
      break;
    case "table":
      array = ["MANUAL", "PATTERN"];
      break;
    case "group":
      array = ["FIELDSET", "FORM", "CONTAINER"];
      break;
    case "custom":
      array = ["ELEMENT", "GROUP"];
      break;
    default:
      array = [];
      break;
  }

  for (var i = 0; i < array.length; i++) {
    array[i] = [array[i], array[i].toLowerCase().replace(/_/g, " ")];
  }

  return array;
}

const mapStateToProps = (state) => {
  return {
    translate: state.translate,
    toLocaleDigits: state.toLocaleDigits,
  };
};

export default connect(mapStateToProps)(NewElement);
