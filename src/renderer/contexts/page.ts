import type { Page } from "@common/@types/generalTypes";

import create from "zustand";

export const usePage = create<Readonly<{ page: Page; }>>(() => ({
	page: "Home",
}));

export const { setState: setPage } = usePage;
