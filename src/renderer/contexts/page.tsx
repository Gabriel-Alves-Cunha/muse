import type { Page } from "@common/@types/typesAndEnums";

import create from "zustand";

export const usePage = create<{
	page: Page;
}>(() => ({
	page: "Home",
}));
