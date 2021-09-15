import { useState, useEffect, useRef } from "react";
import ElementPopper from "react-element-popper";
import { updateDoc } from "../../redux/actions/actions";
import { connect } from "react-redux";
import "./formula_container.css";
const conditionRegex = /\w+\[(?:[^[\]]+\]|\])/g;
const operations = "((?:\\d?\\+?\\-?\\*?\\/?\\(?\\)?)+)";

function FormulaContainer({ schema, setSchema, sheetIndex, doc }) {
  const [inputValue, setInputValue] = useState("");
  const [mustShowSuggestions, setMustShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const popperRef = useRef();

  let [list, setList] = useState([]);
  let schemas = doc.sheets[sheetIndex]?.schemas;

  useEffect(() => {
    if (schema) {
      if (schema.element === "group" || schema.type === "group") {
        schema.values = [];

        for (let $schema of schemas) {
          if ($schema.group === schema.id) {
            schema.values.push($schema.id);
          }
        }
      }

      let text = schema.values ? schema.values.join(" ") : "";

      setList(getFormula(text, schemas, schema.element, schema.type));
    }
  }, [schema, schemas]);

  useEffect(() => {
    function closeSuggestions(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMustShowSuggestions(false);
        setInputValue("");
      }
    }

    document.addEventListener("click", closeSuggestions);

    return () => document.removeEventListener("click", closeSuggestions);
  }, []);

  return (
    <div ref={containerRef} className="input full-width formula-container">
      <ul className="formula" style={{ direction: "ltr" }}>
        {list.map((item, index) => {
          return (
            <li key={index} className={item.className}>
              <span>{item.text}</span>
              <button type="button" onClick={() => deleteItem(index, item)}>
                +
              </button>
            </li>
          );
        })}
        <ElementPopper
          ref={popperRef}
          element={
            <input
              type="text"
              className="text"
              style={{ direction: "ltr" }}
              placeholder="type number (space for separation)"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setMustShowSuggestions(true)}
            />
          }
          popper={
            mustShowSuggestions && (
              <ul className="suggestions">
                {schemas
                  .filter(($schema) => {
                    let regex = new RegExp(
                      "^" + reformatStringForRegex(inputValue)
                    );

                    if (schema.id === $schema.id) return false;

                    if ([schema.element, schema.type].includes("group")) {
                      if ($schema.group) return false;
                      if (schema.group === $schema.id) return false;
                    }

                    return [
                      $schema.name,
                      $schema.id,
                      `value[${$schema.name}`,
                      `value[${$schema.id}`,
                    ].some((str) => regex.test(str));
                  })
                  .map((schema, i) => {
                    let element = null;

                    if (schema.element === "group" || schema.type === "group") {
                      if (
                        list.filter((item) => item.value.includes(schema.id))
                          .length === 0
                      ) {
                        element = (
                          <li
                            className="suggestion-item"
                            key={schema.id}
                            onClick={() => handleChange(undefined, schema.name)}
                          >
                            {schema.name}
                          </li>
                        );
                      }
                    } else if (
                      !["table", "multi select", "group"].includes(
                        schema.element
                      ) &&
                      ![
                        "button",
                        "script",
                        "condition",
                        "date",
                        "time",
                        "checkbox",
                        "switch",
                        "textarea",
                      ].includes(schema.type)
                    ) {
                      element = (
                        <li
                          className="suggestion-item"
                          key={i}
                          onClick={() => handleChange(undefined, schema.name)}
                        >
                          {schema.name}
                        </li>
                      );
                    }

                    return element;
                  })}
              </ul>
            )
          }
          position="bottom-left"
          fixMainPosition
          containerStyle={{
            width: "max-content",
          }}
        />
      </ul>
    </div>
  );

  function handleChange(e, str) {
    let value = str ? str + " " : e.target.value;

    if (value.endsWith(" ") && (str || !isIncomplete(value, schemas))) {
      list = [
        ...list,
        ...getFormula(value, schemas, schema.element, schema.type),
      ];

      value = "";
    }

    popperRef.current.refreshPosition();
    setInputValue(value);
    update();
  }

  function deleteItem(index, item) {
    list = list.filter(($item, i) => i !== index);

    popperRef.current.refreshPosition();
    unGroup(item);
    update();
  }

  function handleKeyDown(e) {
    if (e.key === "Backspace" && !inputValue && list.length > 0) {
      let item = list.pop();

      unGroup(item);
      update();
    }
  }

  function unGroup(item) {
    if (schema.element === "group" || schema.type === "group") {
      doc.sheets[sheetIndex].schemas.forEach(($schema, i) => {
        if ($schema.id === item.value) {
          delete doc.sheets[sheetIndex].schemas[i].group;
        }
      });
    }
  }

  function update() {
    if (schema.element !== "group" && schema.type !== "group") {
      schema.values = list.map((item) => item.value);

      switch (schema.type) {
        case "sum":
          schema.formula = schema.values.join(" + ");
          break;
        case "minus":
          schema.formula = schema.values.join(" - ");
          break;
        case "multiply":
          schema.formula = schema.values.join(" * ");
          break;
        case "devide":
          schema.formula = schema.values.join(" / ");
          break;
        case "average":
          schema.formula = `( ${schema.values.join(" + ")} ) / ${
            schema.values.length
          }`;
          break;
        case "minimum":
          schema.formula = `min[${schema.values.join(", ")}]`;
          break;
        case "maximum":
          schema.formula = `max[${schema.values.join(", ")}]`;
          break;
        default:
          schema.formula = schema.values.join(" ");
          break;
      }

      setSchema(schema);
    } else {
      doc.sheets[sheetIndex].schemas.forEach(($schema, i) => {
        if (list.some((item) => item.value === $schema.id)) {
          doc.sheets[sheetIndex].schemas[i].group = schema.id;
        }
      });
    }

    setList(list);
    // updateDoc(doc)
  }
}

function isIncomplete(text = "", schemas = []) {
  function isIncompletedElementName(text) {
    return (
      schemas.filter((schema) =>
        new RegExp("^" + reformatStringForRegex(text), "g").test(schema.name)
      ).length > 0
    );
  }

  function isIncompletedConditions(text) {
    if (!text) return false;

    while (conditionRegex.test(text.trim())) {
      text = text.replace(conditionRegex, "");
    }

    return /^.*\[.*[^\]]$/.test(text);
  }

  return isIncompletedElementName(text) || isIncompletedConditions(text);
}

function reformatStringForRegex(string) {
  return string.replace(/[*/+\-()[\]{}\s$^]/g, (w) => "\\" + w);
}

function getFormula(text, schemas, elementName, elementType) {
  let candidates = {},
    index = 0,
    array = [],
    schemaList = [...schemas].sort(
      (a, b) => b.name.length - a.name.length || a.name.localeCompare(b.name)
    );

  function getId() {
    index++;

    return `>~r00${index}<`;
  }

  while (conditionRegex.test(text)) {
    const conditionArray = text.match(conditionRegex) || [];

    for (let condition of conditionArray) {
      let id = getId();

      candidates[id] = { type: "condition", condition };
      text = text.replace(condition, id);
    }
  }

  while (text.length > 0) {
    text = text.replace(/^\s+/, "");

    let regex = new RegExp(`^${operations}(>~r00\\d<)`);
    let mustContinue = false;

    while (regex.test(text)) {
      let [, operation = "", id] = text.match(regex);
      let candidate = candidates[id];

      array.push(
        candidate
          ? { ...candidate, operation }
          : { type: "other", string: id, operation }
      );

      text = text.replace(operation + id, "").replace(/^\s+/, "");

      mustContinue = true;
    }

    for (let schema of schemaList) {
      let nameRegex = new RegExp(
        `^${operations}(${reformatStringForRegex(schema.name)})`
      );
      let idRegex = new RegExp(`^${operations}(${schema.id})`);

      if (schema.name && nameRegex.test(text)) {
        array.push({
          type: "schema",
          schema,
          operation: text.match(nameRegex)[1],
        });

        text = text.replace(nameRegex, "").replace(/^\s+/, "");
        mustContinue = true;
      }

      if (idRegex.test(text)) {
        array.push({
          type: "schema",
          schema,
          operation: text.match(idRegex)[1],
        });

        text = text.replace(idRegex, "").replace(/^\s+/, "");
        mustContinue = true;
      }
    }

    if (mustContinue) continue;

    if (text.length > 0) {
      let string = text.split(" ")[0];

      array.push({ type: "other", string });

      text = text.replace(string, "").replace(/^\s+/, "");
    }
  }

  array = array.map((item) => {
    let element = undefined;

    switch (item.type) {
      case "schema":
        if (elementName === "group" || elementType === "group") {
          element = {
            text: item.schema.name,
            value: item.schema.id,
            className: "element",
          };
        } else {
          element = {
            text: `${item.operation || ""}value[${item.schema.name}]`,
            value: `${item.operation || ""}value[${item.schema.id}]`,
            className: "condition",
          };

          if (
            elementName === "operation" &&
            elementType !== "formula" &&
            item.operation &&
            /[^+-\d]/.test(item.operation)
          ) {
            element.className = "invalid";
          }
        }
        break;
      case "condition":
        item.condition = validateCondition(item.condition);

        element = {
          text: `${item.operation || ""}${item.condition.text}`,
          value: `${item.operation || ""}${item.condition.value}`,
          className: "condition",
        };

        if (
          elementName === "group" ||
          elementType === "group" ||
          !item.condition.isValid
        ) {
          element.className = "invalid";
        }

        if (
          elementName === "operation" &&
          !elementType === "formula" &&
          item.operation &&
          /[^+-\d]/.test(item.operation)
        ) {
          element.className = "invalid";
        }
        break;
      default:
        element = {
          text: item.string,
          value: item.string,
          className: "not element",
        };

        if (elementName === "group" || elementType === "group") {
          element.className = "invalid";
        } else if (
          elementName === "operation" &&
          !["formula", "condition", "button", "script"].includes(elementType)
        ) {
          if (
            typeof Number(item.string) === "number" &&
            isFinite(item.string)
          ) {
            element.className = "number";
          } else {
            element.className = "invalid";
          }
        } else {
          element.className = "not element";
        }
    }

    return element;
  });

  return array;

  function validateCondition(condition) {
    if (!condition || typeof condition !== "string")
      return { isValid: false, text: "", value: "" };

    let conditionName = condition.match(/[a-zA-Z]+/)[0],
      text = expandCondition(condition),
      value = condition,
      isValid = true,
      regex,
      id,
      result;

    switch (conditionName) {
      case "value":
        regex = /value\[(.*?)\]/;
        id = condition.match(regex)[1];
        result = validateId(id);

        if (!result.isValid) {
          isValid = false;
          break;
        }

        if (result.schema) {
          value = `value[${result.schema.id}]`;
        } else {
          value = `value[${result.condition.value}]`;
          isValid = result.condition.isValid;
        }
        break;
      case "table":
        regex = /table\[(.*?),(.*?),(.*?)\]/;

        if (!regex.test(condition)) {
          isValid = false;
          break;
        }

        let [, tableName, column, row] = condition.match(regex);

        if (!tableName || !column || !row) {
          isValid = false;
          break;
        }

        if (tableName !== "this") {
          result = validateId(tableName);

          if (!result.isValid) {
            isValid = false;
            break;
          }

          if (result.schema) {
            if (result.schema.element === "table") {
              tableName = result.schema.id;
            } else {
              tableName = `value[${result.schema.id}]`;
            }
          } else {
            if (!result.condition.isValid) {
              isValid = false;
              break;
            }

            tableName = result.condition.value;
          }
        }

        if (column !== "this" && isNaN(column)) {
          result = validateId(column);

          if (!result.isValid) {
            isValid = false;
            break;
          }

          if (result.schema) {
            column = `value[${result.schema.id}]`;
          } else {
            if (!result.condition.isValid) {
              isValid = false;
              break;
            }

            column = result.condition.value;
          }
        }

        if (
          ![
            "this",
            "total",
            "average",
            "minimum",
            "maximum",
            "min",
            "max",
            "sum",
          ].includes(row) &&
          isNaN(row) &&
          !/^(this|\d+)\+?-?\d+$/.test(row)
        ) {
          result = validateId(row);

          if (!result.isValid) {
            isValid = false;
            break;
          }

          if (result.schema) {
            row = `value[${result.schema.id}]`;
          } else {
            if (!result.condition.isValid) {
              isValid = false;
              break;
            }

            row = result.condition.value;
          }
        }

        value = `table[${tableName},${column},${row}]`;
        break;
      default:
        regex = />~r00\d+</;

        function replaceId(id) {
          result = validateId(id);

          if (!result.condition?.isValid) {
            isValid = false;
          } else {
            id = result.condition.value;
          }

          return id;
        }

        while (regex.test(value)) {
          value = value.replace(regex, replaceId);

          if (!isValid) break;
        }
    }

    for (let schema of schemaList) {
      text = text.replace(new RegExp(schema.id, "g"), schema.name);
    }

    return { text: text, value: isValid ? value : text, isValid };
  }

  function expandCondition(condition) {
    let isValid = true;

    while (/>~r00\d+</.test(condition)) {
      const ids = condition.match(/>~r00\d+</g);

      for (let id of ids) {
        const candidate = candidates[id];

        if (!candidate) {
          isValid = false;
          break;
        }

        condition = condition.replace(id, candidate.condition);
      }

      if (!isValid) break;
    }

    return condition;
  }

  function validateId(id) {
    id = id.trim();

    let schema = getPattern(id);
    let result = { isValid: true };

    if (schema) {
      result.schema = schema;
    } else {
      id = candidates[id];

      if (!id) {
        result.isValid = false;
      } else {
        result.condition = validateCondition(id.condition);
      }
    }

    return result;
  }

  function getPattern(id) {
    return schemas.filter(
      (schema) => schema.id === id || schema.name === id
    )[0];
  }
}

const mapStateToProps = ({ sheetIndex, doc, mode }) => ({
  sheetIndex,
  doc,
  mode,
});

const mapDispatchToProps = {
  updateDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(FormulaContainer);
