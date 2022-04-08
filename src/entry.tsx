import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./components/App";

const w = window as any;
const initialHref = w.location.href;

function onPause() {
    // Handle the pause event
    const root = document.getElementById("root");
    if (root) ReactDOM.unmountComponentAtNode(root);
}

function onResume() {
    // Handle the resume event
    w.navigator && w.navigator.splashscreen && w.navigator.splashscreen.show();
    w.location = initialHref;
}

function onMenuKeyDown() {
    // Handle the menubutton event
}

function init() {
    // set to landscape on mobile
    if (screen) screen.orientation.lock("landscape");

    console.log("LOVELY INIT");

    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);

    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("menubutton", onMenuKeyDown, false);

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

// listen for uncaught cordova callback errors
window.addEventListener("cordovacallbackerror", function (event) {
    // event.error contains the original error object
    console.log("CORDOVA CALLBACK ERROR", event);
});
