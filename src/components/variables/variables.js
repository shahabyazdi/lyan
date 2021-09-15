import { useState } from "react";
import FormGroup from "../form_group/form_group";
import Table from "lyan-ui/components/table_layout";
import { getPageData } from "lyan-ui/components/table_layout";
import Select from "lyan-ui/components/select";
import Input from "lyan-ui/components/input";
import { updateDoc } from "../../redux/actions/actions";
import { connect } from "react-redux";

function Variables({
  doc,
  translate,
  settings,
  updateDoc,
  toLocaleDigits,
  languages,
}) {
  const [language, setLanguage] = useState(settings.language);
  const [page, setPage] = useState(1);

  let [activeRows, pageData] = getPageData({
    rows: doc.variables?.[language],
    page,
    rowsPerPage: 10,
  });

  return (
    <div className="variables">
      <FormGroup title="Language">
        <Select
          className="select full-width"
          value={language}
          options={[
            ["en", "en"],
            ["fa", "fa"],
          ]}
          onValueChange={setLanguage}
        />
      </FormGroup>
      <FormGroup title="Variables">
        <Table
          page={page}
          rtl={settings.direction === "rtl"}
          digits={settings.digits[settings.digit]}
          labels={languages[settings.language]}
          setPage={setPage}
          head={[
            {
              name: translate("Row"),
            },
            {
              name: translate("Key"),
            },
            {
              name: translate("Value"),
            },
          ]}
          className="full-width"
          newRow
          onNewRow={() => {
            if (!doc.variables?.[language]) doc.variables[language] = [];

            doc.variables?.[language].push(["", ""]);

            update();
          }}
          {...pageData}
        >
          {activeRows.map(({ row: [key, value], rowIndex }) => {
            return (
              <tr key={rowIndex}>
                <td>{toLocaleDigits(rowIndex + 1)}</td>
                <td>
                  <Input
                    value={key}
                    onValueChange={(value) => {
                      doc.variables[language][rowIndex][0] = value;

                      update();
                    }}
                  />
                </td>
                <td>
                  <Input
                    value={value}
                    onValueChange={(value) => {
                      doc.variables[language][rowIndex][1] = value;

                      update();
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </Table>
      </FormGroup>
    </div>
  );

  function update() {
    updateDoc(doc);
  }
}

const mapStateToProps = (state) => ({
  translate: state.translate,
  doc: state.doc,
  settings: state.settings,
  toLocaleDigits: state.toLocaleDigits,
  languages: state.language,
});

const mapDispatchToProps = {
  updateDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(Variables);
