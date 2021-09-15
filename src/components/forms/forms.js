import { useRef, cloneElement } from "react";
import Form from "lyan-ui/components/float_panel";
import { closeForm, setFormZIndex } from "../../redux/actions/actions";
import { connect } from "react-redux";

function Forms({
  closeForm,
  forms = [],
  zIndex,
  setFormZIndex,
  formZIndex,
  translate,
}) {
  const formRef = useRef();

  return forms.map(renderForm);

  function renderForm(form) {
    return (
      <Form
        key={form.id}
        ref={formRef}
        titleBar={{
          title: translate(form.title),
          onClick: () => setFormZIndex(form.id),
        }}
        style={{ zIndex: zIndex[form.id] || formZIndex + 1 }}
        width={form.width}
        onClose={() => {
          closeForm(form.id);

          if (form.onClose instanceof Function) form.onClose();
        }}
      >
        {form.body}
        {form.onSuccess instanceof Function && (
          <button
            className="button button-primary margin-5 float-right"
            onClick={() =>
              form.onSuccess(() => closeForm(form.id), formRef.current)
            }
          >
            {translate("OK")}
          </button>
        )}
        {form.clone?.map?.((item, index) =>
          cloneElement(item, { key: index, close: () => closeForm(form.id) })
        )}
      </Form>
    );
  }
}

const mapStateToProps = ({ modal, forms, zIndex, formZIndex, translate }) => ({
  modal,
  forms,
  zIndex,
  formZIndex,
  translate,
});

const mapDispatchToProps = {
  closeForm,
  setFormZIndex,
};

export default connect(mapStateToProps, mapDispatchToProps)(Forms);
