import type { Path } from "@common/@types/generalTypes";

import { createSignal } from "solid-js";

export const [getFilesToShare, setFilesToShare] = createSignal<Set<Path>>(
	new Set(),
);
