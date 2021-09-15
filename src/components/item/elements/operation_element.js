import { createElement } from "react";
import Input from "lyan-ui/components/input";
import Number from "lyan-ui/components/number";
import { connect } from "react-redux";

function OperationElement({
  id,
  rowIndex,
  columnIndex,
  mixedData,
  separator,
  itemId = Object.keys(window.values)[0],
  direction,
  digits,
  toLocaleDigits,
}) {
  let value;

  if (rowIndex !== undefined) {
    if (mixedData.isMixed) {
      value =
        window.mixedValues?.[itemId]?.[id]?.[mixedData.rowIndex]?.[columnIndex];
    } else {
      value = window.values?.[itemId]?.[id]?.[rowIndex]?.[columnIndex];
    }
  } else {
    value = window.values?.[itemId]?.[id];
  }

  return createElement(separator ? Number : Input, {
    value: separator ? value ?? "" : toLocaleDigits(value),
    className: "full-width",
    readOnly: true,
    separator,
    direction,
    digits,
  });
}

const mapStateToProps = ({ doc, itemIndex, toLocaleDigits }) => ({
  doc,
  itemIndex,
  toLocaleDigits,
});

export default connect(mapStateToProps)(OperationElement);
