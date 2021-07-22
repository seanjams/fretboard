import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./components/app";

document.addEventListener("DOMContentLoaded", () => {
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
});

document.addEventListener('deviceready', () => {
	screen.orientation.lock("landscape-primary");
});
