import FormGroup from "../../form_group/form_group";
import Section from "lyan-ui/components/section";
import Title from "../../default_sections/shared/titlle";
import Input from "lyan-ui/components/input";
import ID from "../../schema/id";
import FormatDate from "../../format_date/format_date";
import getItemName from "../../../shared/getItemName";
import { updateDoc } from "../../../redux/actions/actions";
import { connect } from "react-redux";

function ItemDetails({
  doc,
  sheetIndex,
  itemIndex,
  toLocale,
  updateDoc,
  toEnglishDigits,
}) {
  const sheet = doc.sheets[sheetIndex];
  const item = sheet.items[itemIndex];

  return (
    <Section
      style={{
        marginTop: "0.8em",
        height: "calc(100% - 5.1em)",
        overflow: "auto",
      }}
    >
      <Title name={toLocale(getItemName(item, sheet, doc))} />
      <div style={{ padding: "10px", margin: "10px", maxWidth: "800px" }}>
        <div className="display-flex margin-bottom-10">
          <FormGroup title="ID" className="flex-1">
            <ID id={item.id} />
          </FormGroup>
          <FormGroup title="Date Created" className="flex-1">
            <FormatDate date={item.date} />
          </FormGroup>
        </div>
        <FormGroup title="Descriptions">
          <Input
            type="textarea"
            className="full-width"
            rows="5"
            value={toLocale(item.descriptions)}
            onValueChange={(value) => {
              doc.sheets[sheetIndex].items[itemIndex].descriptions =
                toEnglishDigits(value);

              updateDoc(doc);
            }}
          />
        </FormGroup>
      </div>
    </Section>
  );
}

const mapStateToProps = ({
  doc,
  sheetIndex,
  itemIndex,
  toLocale,
  toEnglishDigits,
}) => ({
  doc,
  sheetIndex,
  toLocale,
  itemIndex,
  toEnglishDigits,
});

const mapDispatchToProps = {
  updateDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetails);
