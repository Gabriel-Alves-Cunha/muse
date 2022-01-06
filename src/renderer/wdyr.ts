import React from "react";

if (process.env.NODE_ENV !== "production") {
	(async () => {
		console.log(
			"%cwhy-did-you-render enabled!",
			"color: yellow; background: red; font-size: 1.2em; font-weight: bold; padding: 5px;",
		);

		const { default: whyDidYouRender } = await import(
			"@welldone-software/why-did-you-render"
		);

		whyDidYouRender(React, {
			trackAllPureComponents: true,
			hotReloadBufferMs: 3_000,
			trackHooks: true,
		});
	})();
}
