import FormGroup from "../form_group/form_group";
import Element from "./element_item";
import Input from "lyan-ui/components/input";
import ID from "../schema/id";
import FormatDate from "../format_date/format_date";
import getValidSchema from "../../shared/getValidSchema";
import preValueChange from "../../shared/preValueChange";
import newOption from "../../shared/newOption";
import getItemName from "../../shared/getItemName";
import mustLocalizeValue from "../../shared/mustLocalizeValue";
import { updateDoc, updateValue } from "../../redux/actions/actions";
import { connect } from "react-redux";

function EditItem({
  doc,
  updateDoc,
  itemIndex,
  sheetIndex,
  settings,
  external = {},
  toLocaleDigits,
  toEnglishDigits,
  toLocale,
  updateValue,
  refresh,
  language,
}) {
  sheetIndex = external.sheetIndex ?? sheetIndex;
  itemIndex = external.itemIndex ?? itemIndex;

  let sheet = doc.sheets[sheetIndex];
  let item = sheet.items[itemIndex];

  if (sheet.itemFormat === "default" && item.name?.constructor === Object) {
    item.name = getItemName(item, sheet, doc);
  }

  return (
    <div>
      {sheet.itemFormat === "default" ? (
        <FormGroup title="Name">
          <Input
            className="full-width"
            value={item?.name}
            onValueChange={(value) => {
              doc.sheets[sheetIndex].items[itemIndex].name = value;

              updateDoc(doc);
            }}
          />
        </FormGroup>
      ) : (
        sheet.schemas
          .filter((schema) => schema.itemName)
          .map((originalSchema, index) => {
            let schema = getValidSchema(
              originalSchema,
              doc,
              settings,
              toLocale,
              toLocaleDigits,
              language
            );

            if (["select", "multi select"].includes(schema.element)) {
              schema.onNewItemRequested = () => {
                newOption(
                  sheet.schemas.findIndex(({ id }) => id === originalSchema.id),
                  sheetIndex
                );
              };
            }

            schema.onValueChange = (value) => {
              value = toEnglishDigits(value);
              value = preValueChange(schema, value, sheetIndex, itemIndex);

              updateValue(
                originalSchema,
                value,
                sheetIndex,
                itemIndex,
                undefined,
                undefined,
                refresh
              );
            };

            schema.className = "full-width";

            schema.value = mustLocalizeValue({
              ...schema,
              value: item.values[schema.id],
            })
              ? toLocaleDigits(item.values[schema.id])
              : item.values[schema.id] || "";

            delete schema.itemName;

            return (
              <FormGroup key={index} title={schema.name}>
                <Element {...schema} />
              </FormGroup>
            );
          })
      )}
      <div className="display-flex">
        <FormGroup title="ID" className="flex-1">
          <ID id={item?.id} />
        </FormGroup>
        <FormGroup title="Date" className="flex-1">
          <FormatDate date={item?.date} />
        </FormGroup>
      </div>
      <FormGroup title="Descriptions">
        <Input
          type="textarea"
          className="full-width"
          rows="5"
          value={toLocaleDigits(item?.descriptions)}
          onValueChange={(value) => {
            doc.sheets[sheetIndex].items[itemIndex].descriptions =
              toEnglishDigits(value);

            updateDoc(doc);
          }}
        />
      </FormGroup>
    </div>
  );
}

const mapStateToProps = (state) => ({
  doc: state.doc,
  sheetIndex: state.sheetIndex,
  itemIndex: state.itemIndex,
  settings: state.settings,
  toLocaleDigits: state.toLocaleDigits,
  toEnglishDigits: state.toEnglishDigits,
  toLocale: state.toLocale,
  language: state.language,
});

const mapDispatchToProps = {
  updateDoc,
  updateValue,
};

export default connect(mapStateToProps, mapDispatchToProps)(EditItem);
