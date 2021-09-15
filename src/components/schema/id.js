import React, { useState } from "react";
import ElementPopper from "react-element-popper";
import Input from "lyan-ui/components/input";
import { IconCopy } from "@tabler/icons";
import { connect } from "react-redux";

function ID({ id, toLocaleDigits, translate, toEnglishDigits }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="display-flex">
      <Input
        className="input flex-1"
        value={toLocaleDigits(id)}
        readOnly
        direction="ltr"
      />
      <ElementPopper
        element={
          <IconCopy
            style={{
              color: "var(--gray)",
              cursor: "pointer",
            }}
            onClick={() => {
              navigator.clipboard.writeText(toEnglishDigits(id));

              setIsVisible(true);
              setTimeout(() => setIsVisible(false), 800);
            }}
          />
        }
        popper={
          isVisible && (
            <div
              style={{
                backgroundColor: "white",
                padding: "5px 15px",
                borderRadius: "5px",
                border: "1px solid var(--base)",
                boxShadow: "0 0 3px var(--gray)",
              }}
            >
              {translate("Copied")}!
            </div>
          )
        }
        fixMainPosition
        fixRelativePosition
        offsetX={2}
        position="left-center"
      />
    </div>
  );
}

const mapStateToProps = ({ translate, toLocaleDigits, toEnglishDigits }) => ({
  translate,
  toLocaleDigits,
  toEnglishDigits,
});

export default connect(mapStateToProps)(ID);
