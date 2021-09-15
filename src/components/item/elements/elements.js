import Group from "lyan-ui/components/group";
import Fields from "lyan-ui/components/fields";
import Fieldset from "lyan-ui/components/fieldset";
import Accordion from "lyan-ui/components/accordion";
import FloatPanel from "lyan-ui/components/float_panel";
import Options from "lyan-ui/components/options";
import NewSchema from "../new_schema";
import Dropdown from "../../dropdown/dropdown";
import MemoElement from "./memo_element";
import OperationElement from "./operation_element";
import categories from "../../../shared/categories";
import newElement from "../../../shared/newElement";
import getValidSchema from "../../../shared/getValidSchema";
import store from "../../../redux/store/store";
import {
  deleteSchema,
  newForm,
  moveElement,
  setFormZIndex,
} from "../../../redux/actions/actions";
import { connect } from "react-redux";

function Elements({
  schemas,
  deleteSchema,
  newForm,
  moveElement,
  translate,
  setFormZIndex,
  settings,
  language,
}) {
  const { doc, itemIndex, toLocale, toLocaleDigits } = store.getState();

  schemas = schemas.map((schema) =>
    getValidSchema(schema, doc, settings, toLocale, toLocaleDigits, language)
  );

  const { noneGroups, groups, inGroups } = categories(schemas);

  return (
    <div
      style={{
        padding: "0.3em",
        margin: "-0.3em",
        height: "calc(100% - 4.0em)",
        borderRadius: "0.5em",
        overflow: "auto",
      }}
    >
      {renderSchemas(noneGroups, groups)}
    </div>
  );

  function renderSchemas(noneGroups, groups = [], shadow = true) {
    return (
      <>
        {noneGroups && noneGroups.length > 0 && (
          <Fields shadow={shadow} rtl={settings.direction === "rtl"}>
            {noneGroups.map((schema, index) => {
              let options = {
                onDelete: () => {
                  const response = api.confirm(
                    "are you sure you want to delete this schema?"
                  );

                  if (response) deleteSchema(schema);
                },
                onEdit: () => {
                  newForm({
                    title: "Edit Element",
                    body: <NewSchema index={schema.schemaindex} edit />,
                  });
                },
              };

              if (schema.moveup) {
                options.onMoveUp = () => {
                  moveElement(schema.schemaindex, "up");
                };
              }

              if (schema.movedown) {
                options.onMoveDown = () => {
                  moveElement(schema.schemaindex, "down");
                };
              }

              return (
                <Fields.Item key={index}>
                  <Fields.Name>{schema.name}</Fields.Name>
                  <Fields.Element
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    {schema.element === "operation" ? (
                      <OperationElement {...schema} />
                    ) : (
                      <MemoElement originalSchema={{ ...schema }} />
                    )}
                  </Fields.Element>
                  <Fields.Options>
                    <Options {...options} />
                  </Fields.Options>
                </Fields.Item>
              );
            })}
          </Fields>
        )}
        {groups.length > 0 && (
          <div style={{ display: "grid" }}>
            {/* The reason for the existence of this DIV is the observance of the * */}
            {/* correct margin between each group. */}
            {groups.map((schema, index) => {
              let otherItems = [];

              if (schema.moveup) {
                otherItems.push({
                  name: translate("Move Up"),
                  onClick: () => {
                    moveElement(schema.schemaindex, "up");
                  },
                });
              }

              if (schema.movedown) {
                otherItems.push({
                  name: translate("Move Down"),
                  onClick: () => {
                    moveElement(schema.schemaindex, "down");
                  },
                });
              }

              const dropdown = (
                <Dropdown
                  position={
                    settings.language === "fa" ? "bottom-left" : "bottom-right"
                  }
                  items={[
                    {
                      name: translate("New"),
                      onClick: () => newElement(schema.id),
                    },
                    {
                      name: translate("Edit"),
                      onClick: () => {
                        newForm({
                          title: "Edit Element",
                          body: <NewSchema index={schema.schemaindex} edit />,
                        });
                      },
                    },
                    ...otherItems,
                    {
                      name: translate("Remove"),
                      className: "red",
                      onClick: () => {
                        const response = api.confirm(
                          "are you sure you want to delete this schema?"
                        );

                        if (response) deleteSchema(schema, itemIndex);
                      },
                    },
                  ]}
                />
              );

              delete schema.moveup;
              delete schema.movedown;

              schema.name = toLocale(schema.name);

              if (schema.type === "float modal") {
                schema = {
                  ...schema,
                  // panelStyle: { zIndex: zIndex[schema.id] },
                  panelClassName: settings.language === "fa" ? "rtl" : "",
                  buttonStyle: { margin: "5px 15px" },
                  portal: true,
                  onOpen: () => setFormZIndex(schema.id),
                  titleBar: {
                    title: schema.name,
                    onClick: () => setFormZIndex(schema.id),
                    icons: [
                      <FloatPanel.TitlebarIcon key={0}>
                        {dropdown}
                      </FloatPanel.TitlebarIcon>,
                    ],
                  },
                };
              }

              if (schema.type === "accordion") {
                schema.icons = [
                  <Accordion.Icon key="0">{dropdown}</Accordion.Icon>,
                ];
              }

              if (schema.type === "fieldset") {
                schema.icons = [
                  <Fieldset.Icon key="0">{dropdown}</Fieldset.Icon>,
                ];
              }

              if (schema.type === "container") {
                delete schema.displayName;
                delete schema.border;
              }

              return (
                <Group
                  key={index}
                  {...schema}
                  className={`group ${settings.language} ${
                    settings.direction
                  } ${schema.type === "container" ? `group-container` : ""}`}
                >
                  {schema.type === "container" && dropdown}
                  {renderSchemas(...getChilds(inGroups[schema.id]), false)}
                </Group>
              );
            })}
          </div>
        )}
      </>
    );
  }

  function getChilds(schemas) {
    if (!schemas) return [[], []];

    let groups = [];
    let noneGroups = [];

    for (let schema of schemas) {
      if (
        schema.element === "group" ||
        ["group", "script"].includes(schema.type)
      ) {
        groups.push(schema);

        continue;
      }

      noneGroups.push(schema);
    }

    return [noneGroups, groups];
  }
}

const mapStateToProps = ({ settings, translate, language }) => ({
  schemas: window.schemas,
  settings,
  translate,
  language,
});

const mapDispatchToProps = {
  deleteSchema,
  newForm,
  moveElement,
  setFormZIndex,
};

export default connect(mapStateToProps, mapDispatchToProps)(Elements);
