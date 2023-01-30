import type { Page } from "types/generalTypes";

import { create } from "zustand";

export const usePage = create<{ page: Page }>(() => ({
	page: "Home",
}));

export const { setState: setPage } = usePage;
