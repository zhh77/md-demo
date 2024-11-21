import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { HashRouter, Route } from "react-router-dom";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <HashRouter>
    {/* <Route exact path="/*" component={App} /> */}
    <App />
  </HashRouter>
  // </React.StrictMode>
);
