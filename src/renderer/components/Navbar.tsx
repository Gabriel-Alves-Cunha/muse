import type { Page } from "@common/@types/generalTypes";

import {
	MdOutlineVideoLibrary as Home,
	MdOutlineSettings as Settings,
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
	<nav className="grid-area-nav flex flex-col justify-between items-center w-16 h-[calc(100vh-var(--top-decorations-height))] bg-navbar first:mt-10 last:mb-10 no-transition">
		<ThemeToggler />

		<ButtonsForPages />

		<div className="flex flex-col justify-center items-center w-full">
			<Converting />

			<Downloading />
		</div>
	</nav>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const icons: Readonly<Record<Page, JSX.Element>> = Object.freeze({
	Favorites: <Favorites />,
	Download: <Download />,
	Settings: <Settings />,
	History: <History />,
	Convert: <Convert />,
	Home: <Home />,
});

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper function:

function ButtonsForPages() {
	const currPage = usePage().page;

	return (
		<div className="flex flex-col justify-center items-center w-full">
			{pages.map(page => (
				<button
					title={`${t("tooltips.goto")}${t(`pages.${page}`)}`}
					className={page === currPage ?
						"active" :
						"" +
						" flex justify-center items-center h-11 w-11 cursor-pointer bg-none border-none text-icon-deactivated text-base hover:text-icon-active focus:text-icon-active"}
					// eslint-disable-next-line react/no-unknown-property
					onPointerUp={() => setPage({ page })}
					key={page}
				>
					{icons[page]}
				</button>
			))}
		</div>
	);
}
