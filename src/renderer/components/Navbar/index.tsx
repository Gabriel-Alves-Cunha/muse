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

import { Nav, Buttons, PopupsWrapper } from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const Navbar = () => (
	<Nav className="notransition">
		<ThemeToggler />

		<ButtonsForPages />

		<PopupsWrapper>
			<Converting />

			<Downloading />
		</PopupsWrapper>
	</Nav>
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
		<Buttons>
			{pages.map(page => (
				<button
					className={page === currPage ? "active" : ""}
					data-tip={`${t("tooltips.goto")}${t(`pages.${page}`)}`}
					onPointerUp={() => setPage({ page })}
					key={page}
				>
					{icons[page]}
				</button>
			))}
		</Buttons>
	);
}
