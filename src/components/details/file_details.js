import FormGroup from "../form_group/form_group";
import Input from "lyan-ui/components/input";
import Title from "../default_sections/shared/titlle";
import Variables from "../variables/variables";
import FormatDate from "../format_date/format_date";
import ID from "../schema/id";
import { newForm, updateDoc } from "../../redux/actions/actions";
import { connect } from "react-redux";

function FileDetails({
  doc,
  mode,
  updateDoc,
  fileLocation,
  toLocale,
  newForm,
  translate,
  toLocaleDigits,
}) {
  let fileName = getFileName();

  return (
    <>
      <Title name={fileName || translate("untitled file")} />
      <div style={{ padding: "10px", margin: "10px", maxWidth: "800px" }}>
        <div className="display-flex">
          {mode === "file" ? (
            <FormGroup title="All Connections" className="flex-1">
              <Input
                className="full-width"
                value={toLocaleDigits(
                  doc.connections.filter((connection) => !connection.temp)
                    .length
                )}
                readOnly
              />
            </FormGroup>
          ) : (
            <FormGroup title="Template Name" className="flex-1">
              <Input
                className="full-width"
                value={doc.name}
                onValueChange={(value) => {
                  doc.name = value;

                  update();
                }}
              />
            </FormGroup>
          )}
          <FormGroup title="Sheets Number" className="flex-1">
            <Input
              className="full-width"
              value={toLocaleDigits(
                doc.sheets.filter((sheet) => !sheet.temp).length
              )}
              readOnly
            />
          </FormGroup>
        </div>
        <div className="display-flex margin-bottom-10">
          <FormGroup title="ID" className="flex-1">
            <ID id={doc.id} />
          </FormGroup>
          <FormGroup title="Date Created" className="flex-1">
            <FormatDate date={doc.date} />
          </FormGroup>
        </div>
        {doc.template && (
          <div className="display-flex margin-bottom-10">
            <FormGroup title="Template Name" className="flex-1">
              <Input
                className="full-width"
                value={toLocale(doc.template.name)}
                readOnly
              />
            </FormGroup>
            <FormGroup title="Template Date" className="flex-1">
              <FormatDate date={doc.template.date} />
            </FormGroup>
          </div>
        )}
        <FormGroup title="Descriptions" className="margin-bottom-10">
          <Input
            type="textarea"
            className="full-width"
            rows="10"
            value={doc.descriptions}
            onValueChange={(value) => {
              doc.descriptions = value;

              update();
            }}
          />
        </FormGroup>
        <FormGroup title="Variables">
          <button
            className="button button-primary margin-5"
            style={{ display: "block" }}
            onClick={openVariables}
          >
            {translate("View")}
          </button>
        </FormGroup>
      </div>
    </>
  );

  function getFileName() {
    if (mode !== "file") return toLocale(doc.name);
    if (!fileLocation) return;

    let name = fileLocation.split(/\\|\//);

    name = name[name.length - 1].split(".");
    name = name[0];

    return name;
  }

  function openVariables() {
    newForm({
      title: "Variables",
      body: <Variables />,
    });
  }

  function update() {
    updateDoc(doc);
  }
}

const mapStateToProps = (state) => ({
  doc: state.doc,
  mode: state.mode,
  fileLocation: state.fileLocation,
  toLocale: state.toLocale,
  translate: state.translate,
  toLocaleDigits: state.toLocaleDigits,
});

const mapDispatchToProps = {
  newForm,
  updateDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(FileDetails);
