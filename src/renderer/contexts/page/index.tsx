import type { Page } from "@utils/app";

import create from "zustand";

export const usePage = create<{
	page: Page;
}>(() => ({
	page: "Home",
}));
