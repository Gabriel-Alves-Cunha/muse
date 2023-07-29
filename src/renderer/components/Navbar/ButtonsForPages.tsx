import type { Page } from "@common/@types/GeneralTypes";

import {
	MdOutlineVideoLibrary as Home,
	// MdOutlineSettings as Settings,
	MdFavoriteBorder as Favorites,
	MdCloudDownload as Download,
	MdSwapHoriz as Convert,
	MdHistory as History,
} from "react-icons/md";

import { selectT, useTranslator } from "@i18n";
import { pageRef, setPage } from "@contexts/page";
import { pages } from "@utils/app";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const icons: Readonly<Record<Page, JSX.Element>> = {
	Favorites: <Favorites />,
	Download: <Download />,
	History: <History />,
	Convert: <Convert />,
	Home: <Home />,
} as const;

/////////////////////////////////////////

export function ButtonsForPages(): JSX.Element {
	const currPage = pageRef().current;
	const t = useTranslator(selectT);

	return (
		<div className="buttons-for-pages">
			{pages.map((page) => (
				<button
					title={t("tooltips.goto") + t(`pages.${page}`)}
					onPointerUp={() => setPage(page)}
					data-active={page === currPage}
					type="button"
					key={page}
				>
					{icons[page]}
				</button>
			))}
		</div>
	);
}
