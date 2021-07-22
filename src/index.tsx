import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./components/app";

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener(
        "deviceready",
        () => {
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);

            screen.orientation.lock("landscape");
            console.log("YELLO", screen.orientation.type);

            try {
                let oldState = JSON.parse(
                    decodeURIComponent(window.location.search.slice(3))
                );
                ReactDOM.render(<App oldState={oldState} />, root);
            } catch (e) {
                console.warn(
                    "Unable to parse state from url, resorting to default",
                    e
                );
                ReactDOM.render(<App />, root);
            }
        },
        false
    );
});
