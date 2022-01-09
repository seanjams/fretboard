import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./components/app";

function init() {
    // set to landscape on mobile
    if (screen) screen.orientation.lock("landscape");

    console.log("INIT");

    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);

    try {
        let oldState = JSON.parse(
            decodeURIComponent(window.location.search.slice(3))
        );
        ReactDOM.render(<App oldState={oldState} />, root);
    } catch (e) {
        console.warn("Unable to parse state from url, resorting to default", e);
        ReactDOM.render(<App />, root);
    }
}

// comment out for mobile builds
document.addEventListener("DOMContentLoaded", init);
document.addEventListener("deviceready", init);
