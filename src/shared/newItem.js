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
      body: <EditItem external={{ sheetIndex, itemIndex }} />,
      onSuccess: (close, form) => {
        const elements = form.querySelectorAll("[required]");

        for (let element of elements) {
          if (!element.value) {
            return api.alert(
              toLocale(element.name) + translate(" is required")
            );
          }
        }

        //must get updated file.
        let doc = store.getState().doc;

        delete doc.sheets[sheetIndex].items[itemIndex].temp;

        dispatch(updateDoc(doc));
        callback?.({ ...item, itemIndex });
        close();
      },
      onClose: () => {
        doc.sheets[sheetIndex].items.pop();

        dispatch(updateDoc(doc));
      },
    })
  );
}
