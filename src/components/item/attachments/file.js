import {
  IconFile,
  IconFileCode,
  IconFolder,
  IconFileText,
  IconFileZip,
  IconFileCode2,
  IconBrandCss3,
  IconCamera,
  IconBrandHtml5,
} from "@tabler/icons";
import { useState, useEffect, useRef } from "react";
import path from "path";

const props = { width: 85, height: 85, stroke: 1 };

const icons = {
  file: <IconFile {...props} />,
  folder: <IconFolder {...props} />,
  js: <IconFileCode {...props} />,
  html: <IconBrandHtml5 {...props} />,
  css: <IconBrandCss3 {...props} />,
  txt: <IconFileText {...props} />,
  doc: <IconFileText {...props} />,
  docx: <IconFileText {...props} />,
  zip: <IconFileZip {...props} />,
  rar: <IconFileZip {...props} />,
  tar: <IconFileZip {...props} />,
  jpg: <IconCamera {...props} />,
  png: <IconCamera {...props} />,
  md: <IconFileCode2 {...props} />,
};

export default function File({
  type = "file",
  name,
  onClick,
  onDoubleClick,
  rightClickItems = [],
  dir,
}) {
  const [preview, setPreview] = useState();
  const [rightClickData, setRightClickData] = useState({});
  let ext = type === "file" ? name.split(".").pop() : "";
  let ref = useRef();

  useEffect(() => {
    if (type === "forlder") return;

    const supportedExts = ["jpg", "png"];

    if (!supportedExts.includes(ext)) return;

    setPreview(api.previewAttachment(path.join(dir, name)));

    return () => setPreview();
  }, [type, name, dir, ext]);

  useEffect(() => {
    function handleRightClick(e) {
      setRightClickData({
        active: ref.current.contains?.(e.target),
        x: e.clientX,
        y: e.clientY,
      });
    }

    function handleClick() {
      setRightClickData({ active: false });
    }

    window.addEventListener("contextmenu", handleRightClick);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("contextmenu", handleRightClick);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className="file unselectable"
    >
      <div
        style={{ height: "85px", display: "flex", justifyContent: "center" }}
      >
        {preview ? (
          <img src={`data:image/png;base64, ${preview}`} alt="preview" />
        ) : (
          icons[ext] || icons[type]
        )}
      </div>
      <div
        style={{
          height: "25px",
          textAlign: "center",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
          padding: "0 5px",
        }}
        title={name}
      >
        {name}
      </div>
      {rightClickData.active && (
        <ul
          className="right-click"
          style={{
            position: "fixed",
            left: rightClickData.x + "px",
            top: rightClickData.y + "px",
          }}
        >
          {rightClickItems.map(({ name, ...props }, index) => (
            <li key={index} {...props}>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
