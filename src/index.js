import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store/store";
import { Provider } from "react-redux";

//global styles
import "./index.css";
import "./rtl.css";

//calendar colors
import "react-multi-date-picker/styles/colors/yellow.css";
import "react-multi-date-picker/styles/colors/red.css";
import "react-multi-date-picker/styles/colors/purple.css";
import "react-multi-date-picker/styles/colors/green.css";
import "react-multi-date-picker/styles/colors/teal.css";

//time picker backgrounds
import "react-multi-date-picker/styles/colors/analog_time_picker_yellow.css";
import "react-multi-date-picker/styles/colors/analog_time_picker_red.css";
import "react-multi-date-picker/styles/colors/analog_time_picker_purple.css";
import "react-multi-date-picker/styles/colors/analog_time_picker_green.css";
import "react-multi-date-picker/styles/colors/analog_time_picker_teal.css";

//calendar backgrounds
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import "react-multi-date-picker/styles/backgrounds/bg-gray.css";
import "react-multi-date-picker/styles/backgrounds/bg-brown.css";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

reportWebVitals();

api.registerStore(store);
