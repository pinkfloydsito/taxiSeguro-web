import React from "react";
import ReactDOM from "react-dom";
import Root from "./components/Root";
import store from "./store";

const target = document.querySelector('#root');
ReactDOM.render(
    <Root store={store} />,
    target
);
