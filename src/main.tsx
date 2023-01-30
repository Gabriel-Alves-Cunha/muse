import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { _runtimeGlobalsChecker_ } from "@utils/seeLeakedVariables";
import { App } from "./App";

// Importing this so vite keeps it when bundled and
// Electron AppImage can pick it up
import "@assets/logo.png";

if (isDev) {
	setTimeout(
		() => (globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_()),
		10_000,
	);

	// document.designMode = "on";
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
