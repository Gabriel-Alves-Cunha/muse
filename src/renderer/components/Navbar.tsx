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
import { ThemeToggler } from "@components/ThemeToggler";
import { Downloading } from "@components/Downloading";
import { Converting } from "@components/Converting";
import { pages } from "@utils/app";
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

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper function:

function ButtonsForPages() {
	const currPage = usePage().page;
	const buttons: JSX.Element[] = [];

	for (const page of pages)
		buttons.push(
			<button
				title={t("tooltips.goto") + t(`pages.${page}`)}
				className={page === currPage ? "active" : ""}
				onPointerUp={() => setPage({ page })}
				key={page}
			>
				{icons[page]}
			</button>,
		);

	return <div className="buttons-for-pages">{buttons}</div>;
}
