import type { Page } from "@common/@types/generalTypes";

import {
	MdOutlineVideoLibrary as Home,
	// MdOutlineSettings as Settings,
	MdFavoriteBorder as Favorites,
	MdCloudDownload as Download,
	MdSwapHoriz as Convert,
	MdHistory as History,
} from "react-icons/md";

import { setPage, usePage } from "@contexts/page";
import { useTranslation } from "@i18n";
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

export function ButtonsForPages() {
	const currPage = usePage().page;
	const { t } = useTranslation();

	return (
		<div className="buttons-for-pages">
			{pages.map((page) => (
				<button
					title={t("tooltips.goto") + t(`pages.${page}`)}
					className={page === currPage ? "active" : ""}
					onPointerUp={() => setPage({ page })}
					key={page}
				>
					{icons[page]}
				</button>
			))}
		</div>
	);
}
