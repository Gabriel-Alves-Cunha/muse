import type { Component } from "solid-js";

import { Portal } from "solid-js/web";

// TODO: impl no-scroll!
export const BlurOverlay: Component = () => (
	<Portal>
		<div class="blur-sm overlay" />
	</Portal>
);

export const Overlay: Component = () => (
	<Portal>
		<div class="overlay" />
	</Portal>
);
