/// <reference types="@welldone-software/why-did-you-render" />

import React from "react";

// @ts-ignore This has to be like this:
if (process.env.NODE_ENV === "development") {
	const whyDidYouRender = await import(
		"@welldone-software/why-did-you-render"
	).then(res => res.default);

	console.info(
		"%c[why-did-you-render] is on!",
		"background:red;color:white;font-size:1.1rem",
	);

	whyDidYouRender(React, {
		trackAllPureComponents: true,
	});
}
