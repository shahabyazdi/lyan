import Schema from "./schema";
import FormGroup from "../form_group/form_group";
import Select from "lyan-ui/components/select";
import Input from "lyan-ui/components/input";
import { IconTrash } from "@tabler/icons";
import { connect } from "react-redux";

function TableColums({ schema: table, setSchema, translate }) {
  if (!table.schemas) return null;

  return table.schemas.map((columnSchema, columnIndex) => {
    if (table.type === "manual") {
      return (
        <fieldset key={columnIndex} className="parent">
          <legend>{translate("Column") + " " + (columnIndex + 1)}</legend>
          <Trash columnIndex={columnIndex} />
          <div className="display-flex">
            <FormGroup title="Name" className="flex-1">
              <Input
                type="text"
                value={columnSchema.name}
                className="input full-width"
                onValueChange={(value) => update("name", value, columnIndex)}
              />
            </FormGroup>
            <TextAlign schema={columnSchema} columnIndex={columnIndex} />
          </div>
        </fieldset>
      );
    } else {
      return (
        <fieldset key={columnIndex} className="parent">
          <legend>{translate("Column") + " " + (columnIndex + 1)}</legend>
          <Trash columnIndex={columnIndex} />
          <Schema
            schema={columnSchema}
            setSchema={(schema) => {
              table.schemas[columnIndex] = schema;

              update();
            }}
            columnIndex={columnIndex}
            defaultElements={getSupportedElements()}
          />
          <TextAlign schema={columnSchema} columnIndex={columnIndex} />
        </fieldset>
      );
    }
  });

  function TextAlign({ schema, columnIndex }) {
    return (
      <FormGroup title="Text Align" className="flex-1">
        <Select
          {...{
            type: "manual",
            options: [
              [translate("Left"), "left"],
              [translate("Center"), "center"],
              [translate("Right"), "right"],
            ],
            value: schema.align || "left",
            className: "full-width",
          }}
          onChange={(e) => update("align", e.target.value, columnIndex)}
        />
      </FormGroup>
    );
  }

  function update(key, value, columnIndex) {
    if (key) table.schemas[columnIndex][key] = value;

    setSchema(table);
  }

  function getSupportedElements() {
    return [
      [translate("Input"), "input"],
      [translate("Select"), "select"],
      [translate("Multi Select"), "multi select"],
      [translate("Operation"), "operation"],
      [translate("Connection"), "connection"],
      [translate("Custom"), "custom"],
    ];
  }

  function Trash({ columnIndex }) {
    return (
      <IconTrash
        style={{ float: "right", cursor: "pointer" }}
        onClick={() => {
          const response = api.confirm(
            "are you sure you want to delete this column ?"
          );

          if (!response) return;

          table.schemas.splice(columnIndex, 1);

          setSchema(table);
        }}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  translate: state.translate,
});

export default connect(mapStateToProps)(TableColums);
