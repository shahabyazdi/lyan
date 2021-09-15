import { useState } from "react";
import { BlankSchema } from "../schema/schema";
import Tab from "lyan-ui/components/tab";
import SheetDetails from "../details/sheet_details";
import Schemas from "./schemas";
import { IconPlus } from "@tabler/icons";
import { updateDoc } from "../../redux/actions/actions";
import { connect } from "react-redux";

function Editsheet({ doc, sheetIndex, updateDoc, translate, direction }) {
  const [activeTab, setActiveTab] = useState({
    id: "schemas",
  });

  const tabs = [
    { name: translate("Schemas"), id: "schemas" },
    { name: translate("Details"), id: "details" },
  ];

  return (
    <Tab
      tabs={tabs}
      activeTab={activeTab}
      onChange={setActiveTab}
      style={{ height: "100%" }}
      rtl={direction === "rtl"}
      icons={[
        <Tab.Icon onClick={() => newSchema()}>
          <IconPlus />
        </Tab.Icon>,
      ]}
    >
      {activeTab.id === "details" ? <SheetDetails /> : <Schemas />}
    </Tab>
  );

  function newSchema() {
    doc.sheets[sheetIndex].schemas.push(
      new BlankSchema(
        "input",
        "text",
        translate("element") + "-" + (doc.sheets[sheetIndex].schemas.length + 1)
      )
    );

    update();
  }

  function update(key, value) {
    if (key) doc.sheets[sheetIndex][key] = value;

    updateDoc(doc);
  }
}

const mapStateToProps = (state) => ({
  doc: state.doc,
  sheetIndex: state.sheetIndex,
  translate: state.translate,
  direction: state.settings.direction,
});

const mapDispatchToProps = {
  updateDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(Editsheet);
