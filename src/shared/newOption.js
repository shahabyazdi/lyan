import FormGroup from "../components/form_group/form_group";
import Input from "lyan-ui/components/input";
import Select from "lyan-ui/components/select";
import newItem from "./newItem";
import store from "../redux/store/store";
import { newForm, updateDoc, refreshElements } from "../redux/actions/actions";

export default function newOption(schemaIndex, sheetIndex) {
  const { doc, toLocale } = store.getState();
  const sheet = doc.sheets[sheetIndex];
  const schema = sheet.schemas[schemaIndex];
  const dispatch = store.dispatch;

  if (schema.type === "manual") return newOption();

  if (["sheet item", "connection sheet item"].includes(schema.type)) {
    if (schema.mixItems) return openSelectSheetForm();

    newItem(
      doc.sheets.findIndex(({ id }) => id === schema.sheet),
      () => dispatch(refreshElements())
    );
  }

  function newOption() {
    dispatch(
      newForm({
        title: "New Option",
        body: (
          <>
            <FormGroup title="text">
              <Input className="full-width" id="text" />
            </FormGroup>
            <FormGroup title="value">
              <Input className="full-width" id="value" />
            </FormGroup>
          </>
        ),
        onSuccess: (close, form) => {
          const text = form.querySelector("#text").value;
          const value = form.querySelector("#value").value;

          if (!text || !value) return api.alert("text & value are required.");

          doc.sheets[sheetIndex].schemas[schemaIndex].options.push([
            text,
            value,
          ]);

          dispatch(updateDoc(doc));
          close();
        },
      })
    );
  }

  function openSelectSheetForm() {
    dispatch(
      newForm({
        title: "New Option",
        body: (
          <FormGroup title="Select Sheet">
            <Select
              id="sheet"
              className="full-width"
              options={doc.sheets
                .filter(({ id }) => schema.sheets.includes(id))
                .map(({ name, id }) => [toLocale(name), id])}
            />
          </FormGroup>
        ),
        onSuccess: (close, form) => {
          let sheet = form.querySelector("#sheet").value;

          close();

          newItem(
            doc.sheets.findIndex(({ id }) => id === sheet),
            () => dispatch(refreshElements())
          );
        },
      })
    );
  }
}
