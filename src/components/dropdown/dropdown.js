import { useState, useRef, useEffect } from "react";
import ElementPopper from "react-element-popper";
import { IconDotsVertical } from "@tabler/icons";
import "./dropdown.css";

export default function Dropdown({
  items = [],
  className,
  position = "bottom-right",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsVisible(false);
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <ElementPopper
      ref={ref}
      containerClassName={"dropdown " + className || ""}
      position={position}
      zIndex={1}
      element={
        <IconDotsVertical
          className="icon"
          stroke={2}
          onClick={() => setIsVisible(!isVisible)}
        />
      }
      popper={
        isVisible && (
          <ul>
            {items.map((item, index) => (
              <li
                key={index}
                className={item.className}
                onClick={() => {
                  setIsVisible(false);

                  if (item.onClick instanceof Function) item.onClick();
                }}
              >
                {item.name}
              </li>
            ))}
          </ul>
        )
      }
    />
  );
}
