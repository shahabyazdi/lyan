import File from "./file";
import Section from "lyan-ui/components/section";
import FormGroup from "../../form_group/form_group";
import { setAttachmentSubPath, newForm } from "../../../redux/actions/actions";
import { connect } from "react-redux";
import path from "path";
import { IconHome } from "@tabler/icons";
import "./attachments.css";

function Attachments({
  doc,
  sheetIndex,
  itemIndex,
  subPath,
  setAttachmentSubPath,
  newForm,
}) {
  const item = doc.sheets[sheetIndex].items[itemIndex];

  let dir = path.join(doc.id, item.id, ...subPath);
  let { files, folders } = api.readDir(dir);

  return (
    <Section className="attachments">
      <div className="path">
        <IconHome
          onClick={() => setAttachmentSubPath([])}
          className="subpath"
        />
        {subPath.map((path, index) => (
          <input
            className="subpath"
            key={index}
            defaultValue={path}
            type="button"
            onClick={() => setAttachmentSubPath(subPath.slice(0, index + 1))}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {folders.map((folder, index) => (
          <File
            key={index}
            type="folder"
            name={folder.name}
            onDoubleClick={() =>
              setAttachmentSubPath([...subPath, folder.name])
            }
            rightClickItems={getRighClickItems(folder, true)}
          />
        ))}
        {files.map((file, index) => (
          <File
            key={index}
            name={file.name}
            dir={dir}
            onDoubleClick={() =>
              api.excecuteAttachment(path.join(dir, file.name))
            }
            rightClickItems={getRighClickItems(file)}
          />
        ))}
      </div>
    </Section>
  );

  function getRighClickItems({ name }, folder) {
    let fullPath = path.join(dir, name);

    return [
      {
        name: "open",
        onClick: () => {
          if (folder) {
            setAttachmentSubPath([...subPath, name]);
          } else {
            api.excecuteAttachment(path.join(dir, name));
          }
        },
      },
      {
        name: "open in explorer",
        onClick: () =>
          api.excecuteAttachment(path.join(dir, folder ? name : "")),
      },
      {
        name: "rename",
        onClick: () =>
          newForm({
            title: "rename",
            body: (
              <FormGroup title="name">
                <input className="input full-width" defaultValue={name} />
              </FormGroup>
            ),
            onSuccess: (close, form) => {
              const newName = form.querySelector("input").value;

              api.renameAttachment(dir, name, newName);

              close();
              setAttachmentSubPath([...subPath]);
            },
          }),
      },
      {
        name: "delete",
        onClick: () => {
          let response = api.confirm(
            "are you sure you want to delete this file?"
          );

          if (!response) return;

          api.deleteAttachment(fullPath, doc.id);

          setAttachmentSubPath([...subPath]);
        },
      },
    ];
  }
}

const mapStateToProps = (state) => ({
  doc: state.doc,
  sheetIndex: state.sheetIndex,
  itemIndex: state.itemIndex,
  subPath: state.subPath,
});

const mapDispatchToProps = {
  setAttachmentSubPath,
  newForm,
};

export default connect(mapStateToProps, mapDispatchToProps)(Attachments);
