import type { Component } from "solid-js";

import { Portal } from "solid-js/web";

// TODO: impl no-scroll!
export const Overlay: Component = () => (
	<Portal>
		<div class="overlay" />
	</Portal>
);
