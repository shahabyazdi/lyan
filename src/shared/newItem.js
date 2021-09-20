import EditItem from "../components/edit_item/edit_item";
import store from "../redux/store/store";
import { updateDoc, newForm } from "../redux/actions/actions";

export default function newItem(sheetIndex, callback) {
  const dispatch = store.dispatch;
  const { doc, translate, toLocale, getId, ...state } = store.getState();

  sheetIndex = sheetIndex ?? state.sheetIndex;

  const sheet = doc.sheets[sheetIndex];
  const itemIndex = sheet.items.length;
  const name =
    sheet.itemFormat === "default"
      ? translate("Item") + "-" + (itemIndex + 1)
      : {};

  const item = {
    id: getId(),
    name,
    date: Date.now(),
    values: {},
    descriptions: "",
    temp: true,
  };

  doc.sheets[sheetIndex].items.push(item);

  dispatch(
    newForm({
      title: "New Item",
      id: item.id,
      body: <EditItem external={{ sheetIndex, itemIndex }} />,
      onSuccess: (close, form) => {
        const doc = store.getState().doc;
        const elements = form.querySelectorAll("[required]");
        const id = form.getAttribute("data-id");
        const index = doc.sheets[sheetIndex].items.findIndex(
          (item) => item.id === id
        );

        for (let element of elements) {
          if (!element.value) {
            return api.alert(
              toLocale(element.name) + translate(" is required")
            );
          }
        }

        delete doc.sheets[sheetIndex].items[index].temp;

        dispatch(updateDoc(doc));
        callback?.({ ...item, itemIndex: index });
        close();
      },
      onClose: (id) => {
        const doc = store.getState().doc;

        doc.sheets[sheetIndex].items = doc.sheets[sheetIndex].items.filter(
          (item) => item.id !== id
        );

        dispatch(updateDoc(doc));
      },
    })
  );
}
