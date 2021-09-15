import New from "../default_sections/new/new";
import Open from "../default_sections/open/open";
import Settings from "../default_sections/settings/settings";
import FileDetails from "../details/file_details";
import Sheet from "../sheet/sheet";
import Section from "lyan-ui/components/section";
import EditSheet from "../edit_sheet/edit_template_sheet";
import Reports from "../reports/reports";
import { connect } from "react-redux";

function Main({ settings: { main, direction }, mode, sheetIndex }) {
  const style = {
    width: mode === "reports" ? "100%" : main?.width || "calc(100% - 255px)",
  };

  return (
    <main className="main" style={style}>
      {getSection()}
    </main>
  );

  function getSection() {
    if (mode === "reports") {
      return <Reports />;
    } else if (
      ["template", "edit"].includes(mode) &&
      sheetIndex !== undefined
    ) {
      return <EditSheet />;
    } else if (mode === "default" || sheetIndex === undefined) {
      return (
        <div
          style={{
            paddingTop: "0.6em",
            paddingBottom: "0.6em",
            paddingRight: direction === "ltr" ? "0.6em" : "0.3em",
            paddingLeft: "0.3em",
            height: "calc(100% - 2.3em)",
          }}
        >
          <Section
            style={{
              height: "100%",
              overflow: "auto",
            }}
          >
            {mode === "default" ? (
              getDefaultSection(sheetIndex)
            ) : (
              <FileDetails />
            )}
          </Section>
        </div>
      );
    } else {
      return <Sheet />;
    }
  }

  function getDefaultSection(index) {
    switch (index) {
      case 1:
        return <Open />;
      case 3:
        return <Settings />;
      default:
        return <New />;
    }
  }
}

const mapStateToProps = ({ settings, mode, sheetIndex }) => ({
  settings,
  mode,
  sheetIndex,
});

export default connect(mapStateToProps)(Main);
