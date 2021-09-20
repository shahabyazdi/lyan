import NewConnection from "./new_connection";
import FormGroup from "../../form_group/form_group";
import Input from "lyan-ui/components/input";
import Button from "lyan-ui/components/button";
import Section from "lyan-ui/components/section";
import ID from "../../schema/id";
import FormatDate from "../../format_date/format_date";
import { updateDoc, newForm } from "../../../redux/actions/actions";
import getItemName from "../../../shared/getItemName";
import getAllConnections from "../../../shared/getAllConnections";
import { connect } from "react-redux";
import "./connections.css";

function Connections({
  doc,
  updateDoc,
  sheetIndex,
  itemIndex,
  newForm,
  translate,
  toLocale,
  toLocaleDigits,
}) {
  let parent = doc.sheets[sheetIndex].items[itemIndex];
  let connections = doc.connections;
  let [innerConnections, outerConnections] = getAllConnections(
    parent.id,
    connections
  );

  return (
    <div style={{ marginTop: "5px" }}>
      {innerConnections.map((connection, index) => {
        //populating connected sheet & item
        let sheet = doc.sheets.filter(
          (sheet) => sheet.id === connection.sheet
        )[0];
        let item = sheet
          ? sheet.items.filter((item) => item.id === connection.item)[0]
          : "";

        return (
          <Connection
            key={index}
            date={connection.date}
            sheet={sheet}
            item={item}
            id={connection.id}
            descriptions={connection.descriptions}
            doc={doc}
            toLocale={toLocale}
            translate={translate}
            toLocaleDigits={toLocaleDigits}
          />
        );
      })}
      {outerConnections.map((connection, index) => {
        const sheet = doc.sheets.filter(
          (sheet) => sheet.id === connection.parent.sheet
        )[0];
        const item = sheet.items.filter(
          (item) => item.id === connection.parent.item
        )[0];

        return (
          <Connection
            key={index}
            date={connection.date}
            sheet={sheet}
            item={item}
            id={connection.id}
            descriptions={connection.descriptions}
            doc={doc}
            outer
            toLocale={toLocale}
            translate={translate}
            toLocaleDigits={toLocaleDigits}
          />
        );
      })}
    </div>
  );

  function Connection({
    sheet,
    item,
    descriptions,
    id,
    date,
    outer = false,
    doc,
    translate,
    toLocale,
    toLocaleDigits,
  }) {
    return (
      <Section className="connection">
        <div className="display-flex">
          <FormGroup title="Sheet" className="flex-1">
            <Input
              className="full-width"
              value={toLocale(sheet.name)}
              readOnly
            />
          </FormGroup>
          <FormGroup title="Item" className="flex-1">
            <Input
              className="full-width"
              value={toLocaleDigits(getItemName(item, sheet, doc))}
              readOnly
            />
          </FormGroup>
        </div>
        <div className="display-flex">
          <FormGroup title="Date" className="flex-1">
            <FormatDate date={date} />
          </FormGroup>
          <FormGroup title="ID" className="flex-1">
            <ID id={id} />
          </FormGroup>
        </div>
        <FormGroup title="Descriptions">
          <Input
            type="textarea"
            className="full-width"
            rows="5"
            readOnly
            value={toLocaleDigits(descriptions)}
          />
        </FormGroup>
        {!outer && (
          <Button
            className="button button-primary float-right margin-left-5"
            onClick={() => deleteConnection(id)}
          >
            {translate("Delete")}
          </Button>
        )}
        <Button
          className="button button-primary float-right margin-left-5"
          onClick={() => editConnection(id, outer)}
        >
          {translate("Edit")}
        </Button>
      </Section>
    );
  }

  function deleteConnection(id) {
    const response = api.confirm(
      "are you sure you want to delete this connection ?"
    );

    if (!response) return;

    doc.connections = doc.connections.filter(
      (connection) => connection.id !== id
    );

    updateDoc(doc, { getConnectionSchemas: true });
  }

  function editConnection(id, outer = false) {
    let sheets = doc.sheets.filter((sheet, index) => index !== sheetIndex);
    let index = doc.connections.findIndex((connection) => connection.id === id);

    newForm({
      title: "Edit Connection",
      body: <NewConnection index={index} sheets={sheets} outer={outer} />,
    });
  }
}

const mapStateToProps = (state) => {
  return {
    doc: state.doc,
    sheetIndex: state.sheetIndex,
    itemIndex: state.itemIndex,
    toLocale: state.toLocale,
    translate: state.translate,
    toLocaleDigits: state.toLocaleDigits,
  };
};

const mapDispatchToProps = {
  updateDoc,
  newForm,
};

export default connect(mapStateToProps, mapDispatchToProps)(Connections);
