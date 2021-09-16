import { useState } from "react";
import EditItem from "../edit_item/edit_item";
import List from "lyan-ui/components/list";
import Options from "lyan-ui/components/options";
import {
  setItemIndex,
  deleteItem,
  newForm,
  closeItem,
  moveElement,
} from "../../redux/actions/actions";
import getItemName from "../../shared/getItemName";
import newItem from "../../shared/newItem";
import { connect } from "react-redux";

function Items({
  doc,
  newForm,
  sheetIndex,
  setItemIndex,
  itemIndex,
  deleteItem,
  closeItem,
  moveElement,
  translate,
  toLocaleDigits,
  settings,
  language,
}) {
  const [searchValue, setSearchValue] = useState();
  const sheet = doc.sheets[sheetIndex];

  let items = [];

  sheet.items.forEach((item, index) => {
    if (item.temp) return;

    items.push({
      ...item,
      index,
    });
  });

  items.forEach((item, index) => {
    item.moveup = index !== 0;
    item.movedown = index !== items.length - 1;
    item.name = toLocaleDigits(getItemName(item, sheet, doc));
  });

  let activeItem = items[itemIndex];

  if (searchValue) {
    items = items.filter((item) =>
      item.name.toLowerCase().includes(searchValue)
    );
  }

  return (
    <List
      className="items"
      rtl={settings.direction === "rtl"}
      toolbar
      activeItem={activeItem}
      searchValue={searchValue}
      labels={language[settings.language]}
      onSearch={(e) => setSearchValue(e.target.value)}
      onNewItem={() => newItem()}
    >
      {items.map((item, index) => {
        let options = {
          onEdit: () => {
            newForm({
              title: "Edit Item",
              body: (
                <EditItem
                  external={{ itemIndex: item.index }}
                  refresh={item.index === itemIndex}
                />
              ),
            });
          },
          onDelete: () => {
            const response = api.confirm(
              translate("Are you sure you want to delete this item ?")
            );

            if (response) deleteItem(sheetIndex, item.index, item);
          },
        };

        if (activeItem?.id === item.id) {
          options.onClose = () => closeItem();
        }

        if (item.moveup) {
          options.onMoveUp = () => {
            moveElement(item.index, "up", "item");

            if (!activeItem) return;

            if (item.id === activeItem.id) {
              setItemIndex(item.index - 1);
            } else if (item.index - 1 === activeItem.index) {
              setItemIndex(item.index);
            }
          };
        }

        if (item.movedown) {
          options.onMoveDown = () => {
            moveElement(item.index, "down", "item");

            if (!activeItem) return;

            if (item.id === activeItem?.id) {
              setItemIndex(item.index + 1);
            } else if (item.index + 1 === activeItem.index) {
              setItemIndex(item.index);
            }
          };
        }

        return (
          <List.Item
            key={index}
            item={item}
            onClick={() => item.index !== itemIndex && setItemIndex(item.index)}
          >
            <Options {...options} />
          </List.Item>
        );
      })}
    </List>
  );
}

const mapStateToProps = (state) => ({
  doc: state.doc,
  sheetIndex: state.sheetIndex,
  itemIndex: state.itemIndex,
  translate: state.translate,
  toLocaleDigits: state.toLocaleDigits,
  settings: state.settings,
  language: state.language,
});

const mapDispatchToProps = {
  setItemIndex,
  deleteItem,
  newForm,
  closeItem,
  moveElement,
};

export default connect(mapStateToProps, mapDispatchToProps)(Items);
