import FormGroup from "../form_group/form_group";
import Input from "lyan-ui/components/input";
import Select from "lyan-ui/components/select";
import ID from "../schema/id";
import FormatDate from "../format_date/format_date";
import Schema, { BlankSchema } from "../schema/schema";
import { updateDoc } from "../../redux/actions/actions";
import { IconPlus } from "@tabler/icons";
import { connect } from "react-redux";

function EditSheet({
  index,
  doc,
  updateDoc,
  translate,
  toLocaleDigits,
  toEnglishDigits,
  itemName,
}) {
  let sheet = doc.sheets[index];

  return (
    <div>
      <div className="display-flex">
        <FormGroup title="Name" className="flex-1">
          <Input
            id="sheetName"
            className="input full-width"
            value={toLocaleDigits(sheet.name)}
            onValueChange={(value) => update("name", toEnglishDigits(value))}
          />
        </FormGroup>
        <FormGroup title="Date" className="flex-1">
          <FormatDate date={sheet.date} />
        </FormGroup>
      </div>
      <div className="display-flex">
        <FormGroup title="ID" className="flex-1">
          <ID id={sheet.id} />
        </FormGroup>
        <FormGroup title="Items Name Format" className="flex-1">
          <Select
            value={sheet.itemFormat}
            className="select full-width"
            options={[
              [translate("Default"), "default"],
              [translate("Element"), "element"],
            ]}
            onValueChange={(value) => {
              let schemas = doc.sheets[index].schemas || [];

              schemas = schemas.filter(
                ({ itemName }) => itemName !== undefined
              );

              let schema;

              if (value === "element" && schemas.length === 0) {
                schema = new BlankSchema(
                  "input",
                  "text",
                  translate("Element") + "-" + 1
                );

                schema.itemName = true;
              }

              if (value === "element") {
                doc.sheets[index].items.forEach((item, index) => {});
              }

              if (schema) doc.sheets[index].schemas.push(schema);

              update("itemFormat", value);
            }}
          />
        </FormGroup>
      </div>
      {sheet.itemFormat === "element" && (
        <>
          <FormGroup title="Elements Number">
            <div className="display-flex">
              <Input
                type="number"
                value={toLocaleDigits(doc.sheets[index].schemas.length)}
                readOnly
                className="input flex-1"
              />
              <IconPlus
                style={{ margin: "auto", cursor: "pointer" }}
                onClick={() => newSchema()}
              />
            </div>
          </FormGroup>
          {doc.sheets[index].schemas.map((schema, i) => {
            if (itemName && !schema.itemName) return null;

            return (
              <fieldset key={i} className="parent">
                <legend>
                  {translate("Element")} {toLocaleDigits(i + 1)}
                </legend>
                <Schema
                  schema={schema}
                  setSchema={(schema) => {
                    schema.itemName = true;
                    doc.sheets[index].schemas[i] = schema;

                    update();
                  }}
                  defaultElements={getSupportedElements()}
                  parentSheet={doc.sheets[index]}
                />
              </fieldset>
            );
          })}
        </>
      )}
      <FormGroup title="Descriptions">
        <Input
          type="textarea"
          className="input full-width"
          rows="5"
          value={toLocaleDigits(sheet.descriptions)}
          onValueChange={(value) =>
            update("descriptions", toEnglishDigits(value))
          }
        />
      </FormGroup>
    </div>
  );

  function newSchema() {
    let value = doc.sheets[index].schemas.length + 1;

    if (value < 0) return;
    if (value > 3) {
      return api.alert(translate("Maximum number is 3"));
    }

    if (value < doc.sheets[index].schemas.length) {
      doc.sheets[index].schemas.pop();
    } else {
      let schema = new BlankSchema(
        "input",
        "text",
        translate("element") + "-" + value
      );
      schema.itemName = true;

      doc.sheets[index].schemas.push(schema);
    }

    update();
  }

  function getSupportedElements() {
    return [
      [translate("Input"), "input"],
      [translate("Select"), "select"],
    ];
  }

  function update(key, value) {
    if (key) doc.sheets[index][key] = value;

    updateDoc(doc);
  }
}

const mapStateToProps = (state) => ({
  doc: state.doc,
  translate: state.translate,
  toLocaleDigits: state.toLocaleDigits,
  toEnglishDigits: state.toEnglishDigits,
});

const mapDispatchToProps = {
  updateDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(EditSheet);
