import Tab from "lyan-ui/components/tab";
import Elements from "./elements/elements";
import Input from "lyan-ui/components/number";
import UIButton from "lyan-ui/components/button";
import Connections from "./connections/connections";
import Attachments from "./attachments/attachments";
import Details from "./details/details";
import NewConnection from "./connections/new_connection";
import FormGroup from "../form_group/form_group";
import getNewConnection from "../../shared/getNewConnection";
import newElement from "../../shared/newElement";
import { IconPlus } from "@tabler/icons";
import { updateDoc, newForm, setActiveTab } from "../../redux/actions/actions";
import { connect } from "react-redux";

function Item({
  doc,
  sheetIndex,
  itemIndex,
  newForm,
  updateDoc,
  subPath,
  translate,
  activeTab,
  setActiveTab,
  direction,
}) {
  const item = doc.sheets[sheetIndex].items[itemIndex];

  const tabs = [
    { name: "Elements", id: "elements" },
    { name: "Connections", id: "connections" },
    { name: "Attachments", id: "attachments" },
    { name: "Details", id: "details" },
  ].map(({ name, ...rest }) => ({ name: translate(name), ...rest }));

  return (
    <Tab
      style={{ flex: "1" }}
      tabs={tabs}
      activeTab={activeTab}
      onChange={setActiveTab}
      rtl={direction === "rtl"}
      icons={[
        <Tab.Icon onClick={openForm}>
          <IconPlus />
        </Tab.Icon>,
      ]}
    >
      {getActiveTab()}
    </Tab>
  );

  function getActiveTab() {
    switch (activeTab.id) {
      case tabs[1].id:
        return <Connections />;
      case tabs[2].id:
        return <Attachments />;
      case tabs[3].id:
        return <Details />;
      default:
        return <Elements />;
    }
  }

  function openForm() {
    switch (activeTab.id) {
      case tabs[1].id:
        return newConnection();
      case tabs[2].id:
        return newAttachment();
      case tabs[3].id:
        return;
      default:
        newElement();
    }
  }

  function newConnection() {
    let sheets = doc.sheets.filter((sheet, index) => index !== sheetIndex);
    let index = doc.connections.length;

    let connection = getNewConnection(
      item.id,
      doc.sheets[sheetIndex].id,
      sheets[0] ? sheets[0].id : "",
      sheets[0] && sheets[0].items[0] ? sheets[0].items[0].id : ""
    );

    connection.temp = true;

    doc.connections.push(connection);

    newForm({
      title: "New Connection",
      body: <NewConnection sheets={sheets} index={index} />,
      onSuccess: (close, form) => {
        let mustSave = true;

        form.querySelectorAll("select").forEach((select) => {
          if (!select.value) mustSave = false;
        });

        if (!mustSave) return api.alert("both items are required.");

        delete doc.connections[index].temp;

        updateDoc(doc, { getConnectionSchemas: true });
        close();
      },
      onClose: () => {
        doc.connections.pop();

        updateDoc(doc);
      },
    });
  }

  function newAttachment() {
    newForm({
      title: "New Attachment",
      width: "30",
      clone: [
        <Button onClick={newFile}>{translate("File")}</Button>,
        <Button onClick={newFolder}>{translate("Folder")}</Button>,
      ],
    });
  }

  function Button({ close, onClick = () => {}, children }) {
    return (
      <UIButton
        onClick={() => {
          onClick();
          close();
        }}
        className="button full-width button-primary"
        style={{ margin: "5px 0" }}
      >
        {children}
      </UIButton>
    );
  }

  function newFile() {
    newForm({
      title: "New File",
      body: (
        <FormGroup title="Select File">
          <input type="file" multiple className="full-width" />
        </FormGroup>
      ),
      onSuccess: (close, form) => {
        let files = form.querySelector("input").files;

        files = Object.keys(files).map((key) => {
          let file = files[key];

          return {
            name: file.name,
            path: file.path,
          };
        });

        let result = api.newAttachment({
          item: { id: item.id },
          file: { id: doc.id },
          type: "file",
          subPath,
          files,
        });

        updateDoc(doc);

        if (result) close();
      },
    });
  }

  function newFolder() {
    newForm({
      title: "New Folder",
      body: (
        <FormGroup title="Name">
          <Input className="full-width" />
        </FormGroup>
      ),
      onSuccess: (close, form) => {
        let result = api.newAttachment({
          item: { id: item.id },
          file: { id: doc.id },
          folder: { name: form.querySelector("input").value },
          type: "folder",
          subPath,
        });

        updateDoc(doc);

        if (result) close();
      },
    });
  }
}

const mapStateToProps = (state) => ({
  doc: state.doc,
  sheetIndex: state.sheetIndex,
  itemIndex: state.itemIndex,
  subPath: state.subPath,
  translate: state.translate,
  activeTab: state.activeTab,
  direction: state.settings.direction,
});

const mapDispatchToProps = {
  newForm,
  updateDoc,
  setActiveTab,
};

export default connect(mapStateToProps, mapDispatchToProps)(Item);
