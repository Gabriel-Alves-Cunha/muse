import { useSelector } from "@legendapp/state/react";
import {
	MdOutlineVideoLibrary as Home,
	// MdOutlineSettings as Settings,
	MdFavoriteBorder as Favorites,
	MdCloudDownload as Download,
	MdSwapHoriz as Convert,
	MdHistory as History,
} from "react-icons/md";

import { type Page, page, pages } from "@contexts/page";
import { ThemeToggler } from "@components/ThemeToggler";
import { Downloading } from "@components/Downloading";
import { Converting } from "@components/Converting";
import { t } from "@components/I18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const Navbar = () => (
	<nav className="nav">
		<ThemeToggler />

		<ButtonsForPages />

		<div className="min-h-max flex flex-col justify-center items-center w-full">
			<Converting />

			<Downloading />
		</div>
	</nav>
);

/////////////////////////////////////////

export function ButtonsForPages() {
	const currPage = useSelector(() => page.get());

	return (
		<div className="buttons-for-pages">
			{pages.map((page_) => (
				<button
					title={t("tooltips.goto") + t(`pages.${page_}`)}
					className={page_ === currPage ? "active" : ""}
					onPointerUp={() => page.set(page_)}
					key={page_}
				>
					{icons[page_]}
				</button>
			))}
		</div>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const icons: Readonly<Record<Page, JSX.Element>> = {
	Favorites: <Favorites />,
	Download: <Download />,
	History: <History />,
	Convert: <Convert />,
	Home: <Home />,
} as const;
