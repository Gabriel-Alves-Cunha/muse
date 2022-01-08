import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Page } from "@common/@types/types";

import { createContext, useState, useContext } from "react";

type PageProps = {
	setPage: Dispatch<SetStateAction<Page>>;
	page: Page;
};

const Page_Context = createContext({} as PageProps);

function Page_Provider({ children }: { children: ReactNode }) {
	const [page, setPage] = useState<Page>("Home");

	return (
		<Page_Context.Provider value={{ page, setPage }}>
			{children}
		</Page_Context.Provider>
	);
}

const usePage = () => {
	const context = useContext(Page_Context);

	if (!context)
		throw new Error("`usePage` must be used within a `<Page_Provider>`");

	return context;
};

export { usePage, Page_Provider };

Page_Provider.whyDidYouRender = {
	customName: "Page_Provider",
	logOnDifferentValues: false,
};
