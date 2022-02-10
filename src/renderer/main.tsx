import "./wdyr"; // <-- Has to be the first import.

import { StrictMode } from "react";
import { render } from "react-dom";

import { App } from "./App";

render(
	<StrictMode>
		<App />
	</StrictMode>,
	document.getElementById("root"),
);
