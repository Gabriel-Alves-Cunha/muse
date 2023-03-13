import type { Page } from "@common/@types/GeneralTypes";

import { useSnapshot } from "valtio";
import {
	MdOutlineVideoLibrary as Home,
	// MdOutlineSettings as Settings,
	MdFavoriteBorder as Favorites,
	MdCloudDownload as Download,
	MdSwapHoriz as Convert,
	MdHistory as History,
} from "react-icons/md";

import { translation } from "@i18n";
import { pages } from "@utils/app";
import { page } from "@contexts/page";

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
	const pageAccessor = useSnapshot(page);
	const t = useSnapshot(translation).t;

	return (
		<div className="buttons-for-pages">
			{pages.map((page_) => (
				<button
					title={t("tooltips.goto") + t(`pages.${page_}`)}
					data-active={page_ === pageAccessor.curr}
					onPointerUp={() => (page.curr = page_)}
					key={page_}
				>
					{icons[page_]}
				</button>
			))}
		</div>
	);
}
