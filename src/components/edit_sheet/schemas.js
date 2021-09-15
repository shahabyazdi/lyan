import { useRef } from "react";
import Schema from "../schema/schema";
import ModifyItem from "lyan-ui/components/options";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import { updateDoc, moveElement } from "../../redux/actions/actions";
import { connect } from "react-redux";

function Schemas({ doc, sheetIndex, updateDoc, moveElement, settings }) {
  const sheet = doc.sheets[sheetIndex];
  const listRef = useRef();
  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100,
  });
  return (
    <div
      style={{
        marginTop: ".4em",
        height: "calc(100% - 5.05em)",
        overflow: "auto",
      }}
    >
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={listRef}
            width={width}
            height={height}
            rowHeight={cache.rowHeight}
            deferredMeasurementCache={cache}
            rowCount={sheet.schemas.length}
            rowRenderer={({ key, index, style, parent }) => {
              let schema = sheet.schemas[index];

              return (
                <CellMeasurer
                  key={key}
                  cache={cache}
                  parent={parent}
                  columnIndex={0}
                  rowIndex={index}
                >
                  <div key={key} style={style}>
                    <div
                      style={{
                        padding: "0.4em 0.4em",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          [settings.direction === "ltr" ? "right" : "left"]:
                            "10px",
                        }}
                      >
                        <ModifyItem
                          onDelete={() => {
                            let element = sheet.schemas.splice(index, 1)[0];

                            if (
                              [schema.element, schema.type].includes("group")
                            ) {
                              sheet.schemas.forEach((schema) => {
                                if (schema.group && schema.group === element.id)
                                  delete schema.group;
                              });
                            }

                            update();
                          }}
                          onMoveUp={
                            index > 0
                              ? () => moveElement(index, "up")
                              : undefined
                          }
                          onMoveDown={
                            index < sheet.schemas.length - 1
                              ? () => moveElement(index, "down")
                              : undefined
                          }
                        />
                      </div>

                      <div
                        style={{
                          padding: "5px",
                          borderRadius: "5px",
                          backgroundColor: "white",
                          boxShadow: "0 0 3px var(--gray)",
                        }}
                      >
                        <Schema
                          schema={schema}
                          setSchema={(schema) => {
                            doc.sheets[sheetIndex].schemas[index] = schema;

                            update();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CellMeasurer>
              );
            }}
          />
        )}
      </AutoSizer>
    </div>
  );

  function update(key, value) {
    if (key) doc.sheets[sheetIndex][key] = value;

    updateDoc(doc);
  }
}

const mapStateToProps = ({ doc, sheetIndex, settings }) => ({
  doc,
  sheetIndex,
  settings,
});

const mapDispatchToProps = {
  updateDoc,
  moveElement,
};

export default connect(mapStateToProps, mapDispatchToProps)(Schemas);
