import FormGroup from "../form_group/form_group";
import Section from "lyan-ui/components/section";
import Title from "../default_sections/shared/titlle";
import Input from "lyan-ui/components/input";
import FormatDate from "../format_date/format_date";
import ID from "../schema/id";
import { connect } from "react-redux";

function SheetDetails({ doc, sheetIndex, toLocale, mode }) {
  const sheet = doc.sheets[sheetIndex];
  const template = mode === "template";

  return (
    <Section
      className="sheet-details"
      style={{ marginTop: template ? "0.8em" : "" }}
    >
      <Title name={toLocale(sheet.name)} />
      <div style={{ padding: "10px", margin: "10px", maxWidth: "800px" }}>
        <div className="display-flex margin-bottom-10">
          <FormGroup
            title={template ? "Name" : "Items Number"}
            className="flex-1"
          >
            <Input
              className="full-width"
              value={
                template
                  ? sheet.name
                  : toLocale(sheet.items.filter((item) => !item.temp).length)
              }
              readOnly
            />
          </FormGroup>
          <FormGroup title="Date Created" className="flex-1">
            <FormatDate date={sheet.date} />
          </FormGroup>
        </div>
        <div className="display-flex">
          <FormGroup title="ID" className="flex-1">
            <ID id={sheet.id} />
          </FormGroup>
          <FormGroup title="Schemas Number" className="flex-1">
            <Input
              className="full-width"
              value={toLocale(
                sheet.schemas.filter((schema) => !schema.temp).length
              )}
              readOnly
            />
          </FormGroup>
        </div>
        <FormGroup title="Descriptions">
          <Input
            type="textarea"
            className="full-width"
            rows="5"
            value={toLocale(sheet.descriptions)}
            readOnly
          />
        </FormGroup>
      </div>
    </Section>
  );
}

const mapStateToProps = ({ doc, sheetIndex, toLocale, mode }) => ({
  sheetIndex,
  toLocale,
  doc,
  mode,
});

export default connect(mapStateToProps)(SheetDetails);
