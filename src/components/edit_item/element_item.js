import { useState } from "react";
import { connect } from "react-redux";
import Element from "lyan-ui/components/element";

function ElementItem({
  value: initialValue,
  onValueChange,
  toLocaleDigits,
  toEnglishDigits,
  dispatch,
  ...props
}) {
  let [value, setValue] = useState(initialValue);

  return (
    <Element
      value={value}
      onValueChange={handleValueChange}
      onBlur={handleBlur}
      {...props}
    />
  );

  function handleValueChange(value) {
    setValue(value);

    if (
      ["select", "table"].includes(props.element) ||
      ["date", "time", "week", "month", "year"].includes(props.type)
    ) {
      onValueChange(value);
    }
  }

  function handleBlur() {
    if (
      !["select", "table"].includes(props.element) &&
      !["date", "time"].includes(props.type)
    ) {
      if (props.type === "number") value = Number(value);

      onValueChange(value);
    }
  }
}

const mapStateToProps = ({ toLocaleDigits, toEnglishDigits }) => ({
  toLocaleDigits,
  toEnglishDigits,
});

export default connect(mapStateToProps)(ElementItem);
