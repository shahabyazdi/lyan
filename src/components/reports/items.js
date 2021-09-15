import MultiSelect from "lyan-ui/components/multi_select";
import getItemName from "../../shared/getItemName";
import { connect } from "react-redux";

function Items({
  doc,
  selectedSheetIndex,
  selectedItems,
  setSelecteditems,
  language,
  settings,
}) {
  return (
    <MultiSelect
      options={doc.sheets[selectedSheetIndex]?.items?.map?.((item) => ({
        text: getItemName(item, doc.sheets[selectedSheetIndex], doc),
        value: item.id,
      }))}
      value={selectedItems}
      onValueChange={setSelecteditems}
      labels={language[settings.language]}
      digits={settings.digits[settings.digit]}
    />
  );
}

const mapStateToProps = ({ doc, language, settings }) => ({
  doc,
  language,
  settings,
});

export default connect(mapStateToProps)(Items);
