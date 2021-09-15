import { useRef } from "react";
import { connect } from "react-redux";

function Spliter({ settings, mode }) {
  const spliterRef = useRef();

  if (mode === "reports") return null;

  const { sidebar, direction } = settings;
  const drag = sidebar?.drag || { x: 0, y: 0 };
  const delta = sidebar?.delta || { x: 0, y: 0 };

  const style = {
    ["margin" + (direction === "ltr" ? "Left" : "Right")]: "-2px",
  };

  return (
    <div
      ref={spliterRef}
      style={style}
      onMouseDown={applyDrag}
      className="spliter"
    />
  );

  function applyDrag(e) {
    drag.x = e.clientX;
    drag.y = e.clientY;

    let sidebarWidth, mainWidth;

    document.onmousemove = onMouseMove;

    document.onmouseup = () => {
      document.onmousemove = document.onmouseup = null;
      api.saveSettings({
        ...settings,
        sidebar: {
          drag,
          delta,
          width: sidebarWidth,
        },
        main: {
          width: mainWidth,
        },
      });
    };

    function onMouseMove(e) {
      const currentX = e.clientX;
      const currentY = e.clientY;

      delta.x = currentX - drag.x;
      delta.y = currentY - drag.y;

      const element = spliterRef.current;
      const offsetLeft = element.offsetLeft;
      const sidebar = document.querySelector(".sidebar");
      const main = document.querySelector(".main");
      const { clientWidth } = document.documentElement;

      sidebarWidth = sidebar.offsetWidth;

      let left = offsetLeft + delta.x;

      if (
        (direction === "ltr" && (left > 500 || left < 180)) ||
        (direction === "rtl" &&
          (clientWidth - 500 > left || clientWidth - 180 < left))
      )
        return;

      delta.x = delta.x * (direction === "ltr" ? 1 : -1);
      sidebarWidth += delta.x;

      mainWidth = `calc(100% - ${sidebarWidth + 5 + "px"})`;
      drag.x = currentX;
      drag.y = currentY;

      sidebar.style.width = sidebarWidth + "px";
      main.style.width = mainWidth;
    }
  }
}

const mapStateToProps = ({ settings, mode }) => ({
  settings,
  mode,
});

export default connect(mapStateToProps)(Spliter);
