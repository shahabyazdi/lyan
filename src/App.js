import Main from "./components/main/main";
import Sidebar from "./components/sidebar/sidebar";
import Spliter from "./components/spliter/spliter";
import Forms from "./components/forms/forms";
import { connect } from "react-redux";

function App({ direction, language }) {
  return (
    <div className={`App ${direction} ${language}`}>
      <Sidebar />
      <Spliter />
      <Main />
      <Forms />
    </div>
  );
}

const mapStateToProps = ({ settings }) => ({
  direction: settings.direction,
  language: settings.language,
});

export default connect(mapStateToProps)(App);
