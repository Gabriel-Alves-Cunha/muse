import type { Page } from "@common/@types/typesAndEnums";

import create from "zustand";

type PageProps = {
	setPage(page: Page): void;
	page: Page;
};

export const usePage = create<PageProps>(set => ({
	setPage: (page: Page) => set(() => ({ page })),
	page: "Home",
}));
