import SheetDetails from "../details/sheet_details";
import Items from "./items";
import Item from "../item/item";
import { connect } from "react-redux";
import "./sheet.css";

function Sheet({ itemIndex }) {
  return (
    <div className="sheet">
      <Items />

      {itemIndex === undefined ? <SheetDetails /> : <Item />}
    </div>
  );
}

const mapStateToProps = ({ itemIndex }) => ({
  itemIndex,
});

export default connect(mapStateToProps)(Sheet);
