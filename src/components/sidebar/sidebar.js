import { useState } from "react";
import List from "lyan-ui/components/list";
import EditSheet from "../edit_sheet/edit_sheet";
import Options from "lyan-ui/components/options";
import {
  setSheetIndex,
  newForm,
  updateDoc,
  closeSheet,
  deleteSheet,
  moveElement,
} from "../../redux/actions/actions";
import { connect } from "react-redux";

function Sidebar({
  mode,
  sidebar,
  sheetIndex,
  setSheetIndex,
  getId,
  newForm,
  doc,
  translate,
  updateDoc,
  defaultSections,
  closeSheet,
  deleteSheet,
  moveElement,
  toLocale,
  settings,
  language,
}) {
  const [searchValue, setSearchValue] = useState();

  if (mode === "reports") return null;

  const style = {
    width: (sidebar?.width < 250 ? "250" : sidebar.width) + "px",
  };

  let items = getitems();
  let activeItem = items[sheetIndex];

  if (searchValue) {
    items = items.filter((item) =>
      item.name.toLowerCase().includes(searchValue)
    );
  }

  return (
    <aside className="sidebar" style={style}>
      <List
        style={{
          height: "100%",
          [settings.direction === "ltr" ? "paddingRight" : "paddingLeft"]:
            ".25em",
        }}
        rtl={settings.direction === "rtl"}
        activeItem={activeItem}
        toolbar={mode !== "default"}
        gray
        onNewItem={newSheet}
        searchValue={searchValue}
        onSearch={(e) => setSearchValue(e.target.value)}
        labels={language[settings.language]}
      >
        {items.map((item, index) => {
          let options;

          if (mode !== "default") {
            options = {
              onEdit: () => editSheet(item.index),
              onDelete: () => removeSheet(item.index),
            };

            if (item.id === activeItem?.id) {
              options.onClose = () => closeSheet();
            }

            if (item.moveup) {
              options.onMoveUp = () => {
                moveElement(item.index, "up", "sheet");

                if (item.id === activeItem.id) {
                  setSheetIndex(item.index - 1);
                } else if (item.index - 1 === activeItem.index) {
                  setSheetIndex(item.index);
                }
              };
            }

            if (item.movedown) {
              options.onMoveDown = () => {
                moveElement(item.index, "down", "sheet");

                if (item.id === activeItem.id) {
                  setSheetIndex(item.index + 1);
                } else if (item.index + 1 === activeItem.index) {
                  setSheetIndex(item.index);
                }
              };
            }
          }

          return (
            <List.Item
              key={index}
              item={item}
              onClick={() => {
                let i = mode === "default" ? index : item.index;

                if (i === sheetIndex) return;

                setSheetIndex(i);
              }}
            >
              {mode !== "default" && <Options {...options} />}
            </List.Item>
          );
        })}
      </List>
    </aside>
  );

  function getitems() {
    if (mode === "default") {
      return defaultSections.map(({ name }) => ({ name: translate(name) }));
    }

    let items = [];

    doc?.sheets?.forEach?.((sheet, index) => {
      if (sheet.temp) return;

      items.push({ name: toLocale(sheet.name), id: sheet.id, index });
    });

    items.forEach((sheet, index) => {
      sheet.moveup = index !== 0;
      sheet.movedown = index !== items.length - 1;
    });

    return items;
  }

  function newSheet() {
    let index = doc.sheets.length;

    let sheet = {
      id: getId(),
      name: translate("sheet") + "-" + (index + 1),
      itemFormat: "default",
      date: Date.now(),
      schemas: [],
      items: [],
      descriptions: "",
      itemName: true,
      temp: true,
    };

    doc.sheets.push(sheet);

    newForm({
      title: "New Sheet",
      body: <EditSheet index={index} itemName />,
      onSuccess: (close, form) => {
        let name = form.querySelector("[id='sheetName']");

        if (!name.value) return api.alert("name is required");

        delete doc.sheets[index].temp;

        update();
        close();
      },
      onClose: () => {
        doc.sheets.pop();

        update();
      },
    });
  }

  function update() {
    updateDoc(doc);
  }

  function editSheet(index) {
    newForm({
      title: "Edit Sheet",
      body: <EditSheet index={index} itemName />,
    });
  }

  function removeSheet(index) {
    const response = api.confirm(
      translate("Are you sure you want to delete this sheet ?")
    );

    if (response) deleteSheet(index);
  }
}

const mapStateToProps = (state) => ({
  mode: state.mode,
  sidebar: state.settings.sidebar,
  sheetIndex: state.sheetIndex,
  doc: state.doc,
  getId: state.getId,
  translate: state.translate,
  defaultSections: state.defaultSections,
  toLocale: state.toLocale,
  settings: state.settings,
  language: state.language,
});

const mapDispatchToProps = {
  setSheetIndex,
  newForm,
  updateDoc,
  closeSheet,
  deleteSheet,
  moveElement,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
