import getInitialValue from "./getInitialValue";
import NewSchema from "../components/item/new_schema";
import store from "../redux/store/store";
import { BlankSchema } from "../components/schema/schema";
import { newForm, updateDoc } from "../redux/actions/actions";

export default function newElement(groupId) {
  const { doc, translate, sheetIndex, itemIndex } = store.getState();

  let index = doc.sheets[sheetIndex].schemas.length;

  let schema = new BlankSchema(
    "input",
    "text",
    translate("Element") + "-" + (index + 1)
  );

  schema.temp = true;

  doc.sheets[sheetIndex].schemas.push(schema);

  store.dispatch(
    newForm({
      title: "New Element",
      id: schema.id,
      body: <NewSchema index={index} />,
      onSuccess: (close, form) => {
        const id = form.getAttribute("data-id");
        const index = doc.sheets[sheetIndex].schemas.findIndex(
          (schema) => schema.id === id
        );

        delete doc.sheets[sheetIndex].schemas[index].temp;

        doc.sheets[sheetIndex].schemas[index].group = groupId;

        let schema = doc.sheets[sheetIndex].schemas[index];

        if (["select", "operation"].includes(schema.element)) {
          doc.sheets[sheetIndex].items[itemIndex].values[schema.id] =
            getInitialValue(schema);
        }

        if (["checkbox", "switch"].includes(schema.type)) {
          doc.sheets[sheetIndex].items[itemIndex].values[schema.id] = false;
        }

        store.dispatch(
          updateDoc(doc, {
            getConnectionSchemas:
              form.querySelector("[name='element']").value === "connection",
            recalculate: true,
          })
        );

        close();
      },
      onClose: (id) => {
        doc.sheets[sheetIndex].schemas = doc.sheets[sheetIndex].schemas.filter(
          (schema) => schema.id !== id
        );

        store.dispatch(updateDoc(doc));
      },
    })
  );
}
