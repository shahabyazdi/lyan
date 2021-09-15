import Schema from "../schema/schema";
import { updateDoc } from "../../redux/actions/actions";
import { connect } from "react-redux";

function NewSchema({ doc, updateDoc, sheetIndex, index, edit }) {
  return (
    <Schema
      schema={doc.sheets[sheetIndex].schemas[index]}
      setSchema={(schema) => {
        doc.sheets[sheetIndex].schemas[index] = schema;

        updateDoc(doc, { recalculate: true });
      }}
      edit={edit}
      parentSheet={doc.sheets[sheetIndex]}
    />
  );
}

const mapStateToProps = ({ doc, sheetIndex }) => ({
  doc,
  sheetIndex,
});

const mapDispatchToProps = {
  updateDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(NewSchema);
