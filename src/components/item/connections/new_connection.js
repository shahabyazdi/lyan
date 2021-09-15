import FormGroup from "../../form_group/form_group";
import Select from "lyan-ui/components/select";
import Input from "lyan-ui/components/input";
import ID from "../../schema/id";
import FormatDate from "../../format_date/format_date";
import getItemName from "../../../shared/getItemName";
import { updateDoc } from "../../../redux/actions/actions";
import { connect } from "react-redux";

function NewConnection({
  doc,
  updateDoc,
  sheets,
  index,
  outer,
  toLocale,
  toLocaleDigits,
  toEnglishDigits,
}) {
  let connection = doc.connections[index];
  let sheet = sheets.find((sheet) => sheet.id === connection.sheet);
  let items = sheet
    ? sheet.items.map((item) => [
        toLocaleDigits(getItemName(item, sheet, doc)),
        item.id,
      ])
    : [];

  if (outer) {
    let $sheet = doc.sheets.find(
      (sheet) => sheet.id === connection.parent.sheet
    );

    items =
      $sheet?.items?.map?.((item) => [
        toLocaleDigits(getItemName(item, $sheet, doc)),
        item.id,
      ]) || [];
  }

  return (
    <div>
      <div className="display-flex">
        <FormGroup title="Select Sheet" className="flex-1">
          <Select
            className="full-width"
            options={sheets.map((sheet) => [toLocale(sheet.name), sheet.id])}
            value={outer ? connection.parent.sheet : connection.sheet}
            disabled={outer}
            onValueChange={(value) => {
              let sheet = doc.sheets.filter((sheet) => sheet.id === value)[0];
              let item = sheet.items[0];

              doc.connections[index].sheet = sheet.id;
              doc.connections[index].item = item ? item.id : "";

              updateDoc(doc);
            }}
          />
        </FormGroup>
        <FormGroup title="Select Item" className="flex-1">
          <Select
            className="full-width"
            options={items}
            value={outer ? connection.parent.item : connection.item}
            disabled={outer}
            onValueChange={(value) => {
              doc.connections[index].item = value;

              updateDoc(doc);
            }}
          />
        </FormGroup>
      </div>
      <div className="display-flex">
        <FormGroup title="Date" className="flex-1">
          <FormatDate date={connection.date} />
        </FormGroup>
        <FormGroup title="ID" className="flex-1">
          <ID id={connection.id} />
        </FormGroup>
      </div>
      <FormGroup title="Descriptions">
        <Input
          type="textarea"
          rows="5"
          className="full-width"
          value={toLocaleDigits(connection.descriptions)}
          onValueChange={(value) => {
            doc.connections[index].descriptions = toEnglishDigits(value);

            updateDoc(doc);
          }}
        />
      </FormGroup>
    </div>
  );
}

const mapStateToProps = (state) => ({
  doc: state.doc,
  toLocale: state.toLocale,
  toLocaleDigits: state.toLocaleDigits,
  toEnglishDigits: state.toEnglishDigits,
});

const mapDispatchToProps = {
  updateDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(NewConnection);
