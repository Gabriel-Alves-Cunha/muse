import { I18nContext } from "@solid-primitives/i18n";
import { Router } from "@solidjs/router";
import { render } from "solid-js/web";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { lang } from "./i18n";
import { App } from "./App";

if (isDev) {
	globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_();

	setTimeout(() => window.runtimeGlobalsChecker.getRuntimeGlobals(), 5_000);

	// document.designMode = "on";
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

render(
	() => (
		<Router>
			<I18nContext.Provider value={lang}>
				<App />
			</I18nContext.Provider>
		</Router>
	),
	document.getElementById("root") as HTMLElement,
);
