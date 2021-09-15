import Input from "lyan-ui/components/input";
import { connect } from "react-redux";

function FormatDate({ date, toLocaleDigits, formatDate }) {
  return (
    <Input
      className="full-width"
      value={toLocaleDigits(formatDate(date))}
      direction="ltr"
      readOnly
    />
  );
}

const mapStateToProps = ({ toLocaleDigits, formatDate }) => ({
  toLocaleDigits,
  formatDate,
});

export default connect(mapStateToProps)(FormatDate);
