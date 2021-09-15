import Title from "../shared/titlle";
import Container from "../shared/container";
import Icon from "../shared/icon";
import { IconFolderPlus, IconFile } from "@tabler/icons";
import { connect } from "react-redux";
import "./open.css";

function Open({ recentFiles, translate }) {
  return (
    <>
      <Title name="Open" />
      <Container>
        <Icon
          name={translate("Browse For File")}
          icon={<IconFolderPlus />}
          onClick={() => api.open()}
        />
      </Container>
      <Title name="Recent Files" />
      <Container>
        <ul className="recent-files">
          {recentFiles.map(({ name, dir }, index) => (
            <li key={index}>
              <h4 onClick={() => api.open(dir)}>
                <IconFile />
                {name}
              </h4>
              <p>{dir}</p>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}

const mapStateToProps = ({ settings, translate }) => ({
  recentFiles: settings.recentFiles,
  translate,
});

export default connect(mapStateToProps)(Open);
