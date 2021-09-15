import Title from "../shared/titlle";
import Container from "../shared/container";
import Icon from "../shared/icon";
import { IconTemplate, IconFile } from "@tabler/icons";
import { newDoc, openDoc } from "../../../redux/actions/actions";
import { connect } from "react-redux";

function New({ sheetIndex, language, newDoc, openDoc, translate }) {
  const templates = api.getTemplates();

  return (
    <>
      {!sheetIndex && (
        <>
          <Title name="New" />
          <Container>
            <Icon
              icon={<IconTemplate />}
              name={translate("Template")}
              onClick={() => newDoc("template")}
            />
            <Icon
              icon={<IconFile />}
              name={translate("Blank File")}
              onClick={() => newDoc("file")}
            />
          </Container>
        </>
      )}
      <Title name={sheetIndex ? "Edit" : "From Template"} />
      <Container>
        {templates.map((template, index) => {
          let array = template.variables?.[language];
          let variables = Array.isArray(array) ? Object.fromEntries(array) : {};

          return (
            <Icon
              key={index}
              icon={<IconTemplate />}
              name={variables[template.name] || template.name}
              onClick={() => {
                if (sheetIndex) {
                  openDoc(template, { index, mode: "edit" });
                } else {
                  newDoc("file", template);
                }
              }}
            />
          );
        })}
      </Container>
    </>
  );
}

const mapStateToProps = ({ sheetIndex, settings, translate }) => ({
  sheetIndex,
  language: settings.language,
  translate,
});

const mapDispatchToProps = {
  openDoc,
  newDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(New);
