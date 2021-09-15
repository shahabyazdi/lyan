import FormGroupComponent from "lyan-ui/components/form_group";
import { connect } from "react-redux";

function FormGroup({
  title,
  translate,
  children,
  toLocale,
  dispatch,
  ...props
}) {
  return (
    <FormGroupComponent title={toLocale(translate(title))} {...props}>
      {children}
    </FormGroupComponent>
  );
}

const mapStateToProps = ({ translate, toLocale }) => ({
  translate,
  toLocale,
});

export default connect(mapStateToProps)(FormGroup);
