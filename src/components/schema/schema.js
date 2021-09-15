import MoreOptions from "./more_options";
import FormGroup from "../form_group/form_group";
import ID from "./id";
import Input from "lyan-ui/components/input";
import Select from "lyan-ui/components/select";
import FormatDate from "../format_date/format_date";
import { ObjectID } from "bson";
import { connect } from "react-redux";

function Schema({
  defaultElements,
  edit,
  schema,
  setSchema,
  columnIndex,
  translate,
  toLocaleDigits,
  toEnglishDigits,
  parentSheet,
}) {
  const elements = [
    [translate("Input"), "input"],
    [translate("Select"), "select"],
    [translate("Multi Select"), "multi select"],
    [translate("Operation"), "operation"],
    [translate("Connection"), "connection"],
    [translate("Table"), "table"],
    [translate("Group"), "group"],
    [translate("Custom"), "custom"],
  ];

  return (
    <div>
      <div className="display-flex">
        <FormGroup title="Element" className="flex-1">
          <Select
            name="element"
            className={"full-width"}
            value={schema.element}
            options={defaultElements || elements}
            onChange={(e) => {
              let group = schema.group;
              let temp = schema.temp;

              schema = new BlankSchema(
                e.target.value,
                getTypes(e.target.value)[0][1],
                schema.name,
                schema.id
              );

              if (group) schema.group = group;
              if (temp) schema.temp = temp;

              setSchema(schema);
            }}
            disabled={edit}
          />
        </FormGroup>
        <FormGroup title="Type" className="flex-1">
          <Select
            className={"full-width"}
            value={schema.type}
            options={getTypes(schema.element)}
            onChange={(e) => {
              let group = schema.group;
              let temp = schema.temp;

              schema = new BlankSchema(
                schema.element,
                e.target.value,
                schema.name,
                schema.id
              );

              if (group) schema.group = group;
              if (temp) schema.temp = temp;

              setSchema(schema);
            }}
            disabled={edit}
          />
        </FormGroup>
      </div>
      <div className="display-flex">
        <FormGroup title="ID" className="flex-1">
          <ID id={schema.id} />
        </FormGroup>
        <FormGroup title="Date" className="flex-1">
          <FormatDate date={schema.date} />
        </FormGroup>
      </div>
      <div className="display-flex">
        <FormGroup title="Name" className="flex-1">
          <Input
            type="text"
            className="input full-width"
            value={toLocaleDigits(schema.name)}
            onValueChange={(value) => {
              schema.name = toEnglishDigits(value);

              setSchema(schema);
            }}
          />
        </FormGroup>
        {!["operation", "table", "group"].includes(schema.element) &&
        !["group", "script", "button"].includes(schema.type) ? (
          <FormGroup title="Required" className="flex-1">
            <Select
              type={"manual"}
              className={"full-width"}
              value={schema.required ? "true" : "false"}
              options={[
                [translate("False"), "false"],
                [translate("True"), "true"],
              ]}
              onChange={(e) => {
                schema.required = e.target.value === "true";

                setSchema(schema);
              }}
            />
          </FormGroup>
        ) : (
          schema.element === "table" && (
            <FormGroup title="Layout" className="flex-1">
              <Select
                type={"manual"}
                className={"full-width"}
                options={[
                  [translate("Table"), "table"],
                  [translate("Tab"), "tab"],
                ]}
                value={schema.layout}
                onChange={(e) => {
                  schema.layout = e.target.value;

                  setSchema(schema);
                }}
              />
            </FormGroup>
          )
        )}
      </div>
      {
        <MoreOptions
          schema={schema}
          setSchema={setSchema}
          columnIndex={columnIndex}
          parentSheet={parentSheet}
        />
      }
    </div>
  );

  function getTypes(element = "input") {
    let array = undefined;

    switch (element) {
      case "input":
        array = [
          "Text",
          "Email",
          "Number",
          "Date",
          "Time",
          "Week",
          "Month",
          "Year",
          "Checkbox",
          "Switch",
          "Color",
          "Textarea",
          "Code Editor",
        ];
        break;
      case "select":
        array = ["Manual", "Sheet Item", "Connection Sheet Item"];
        break;
      case "multi select":
        array = ["Manual", "Sheet Item"];
        break;
      case "operation":
        array = [
          "Sum",
          "Minus",
          "Multiply",
          "Devide",
          "Average",
          "Minimum",
          "Maximum",
          "Formula",
          "Condition",
          "Button",
          "Script",
        ];
        break;
      case "connection":
        array = ["Element"];
        break;
      case "table":
        array = ["Manual", "Schema"];
        break;
      case "group":
        array = ["Accordion", "Fieldset", "Float Modal", "Container"];
        break;
      case "custom":
        array = ["Element", "Group"];
        break;
      default:
        array = [];
        break;
    }

    for (var i = 0; i < array.length; i++) {
      array[i] = [translate(array[i]), array[i].toLowerCase()];
    }

    return array;
  }
}

export function BlankSchema(
  element,
  type,
  name,
  id = new ObjectID().toHexString()
) {
  this.element = element;
  this.type = type;
  this.required = false;
  this.name = name;
  this.id = id;
  this.date = Date.now();

  switch (element + " " + type) {
    case "input number":
      this.separator = false;
      break;
    case "input date":
      this.mode = "single";
      this.timePicker = false;
      break;
    case "code editor":
      this.language = "js";
      break;
    case "select manual":
    case "select sheet item":
    case "multi select manual":
      this.options = [];
      this.emptyOption = false;
      this.allowMoreOptions = false;

      if (type === "sheet item") {
        this.mixItems = false;
        this.itemFormat = "item";
        this.sheet = "";
      }

      break;
    case "operation sum":
    case "operation minus":
    case "operation multiple":
    case "operation devide":
    case "operation average":
    case "operation minimum":
    case "operation maximum":
    case "operation formula":
    case "operation condition":
      this.formula = "";

      if (type !== "condition") {
        this.values = [];
        this.separator = false;
      }

      break;
    case "operation button":
      this.onClick = "";
      break;
    case "operation script":
      this.onLoad = "";
      break;
    case "connection element":
      this.connectedSheet = "";
      break;
    case "table manual":
    case "table schema":
      this.layout = "table";
      this.schemas = [];
      this.counter = false;
      this.rowsLimit = 0;
      break;
    case "group fieldset":
      this.collapse = false;
      break;
    case "group form":
      this.width = "70";
      break;
    case "group container":
      this.display = "horizontal";
      break;
    case "group float modal":
      this.removePanelOnHide = true;
      break;
    case "custom element":
    case "custom group":
      this.html = "";
      this.css = "";
      this.script = "";
      break;
    default:
      break;
  }
}

const mapStateToProps = (state) => ({
  translate: state.translate,
  toLocaleDigits: state.toLocaleDigits,
  toEnglishDigits: state.toEnglishDigits,
});

export default connect(mapStateToProps)(Schema);
