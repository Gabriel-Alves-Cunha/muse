import type { Page } from "@common/@types/generalTypes";

import {
	MdOutlineVideoLibrary as Home,
	MdOutlineSettings as Settings,
	MdFavoriteBorder as Favorites,
	MdCloudDownload as Download,
	MdSwapHoriz as Convert,
	MdHistory as History,
} from "react-icons/md";

import { ThemeToggler } from "@modules/ThemeToggler";
import { Downloading } from "@modules/Downloading";
import { Converting } from "@modules/Converting";
import { Tooltip } from "@components/Tooltip";
import { usePage } from "@contexts/page";
import { pages } from "@utils/app";

import { ScaleUpIconButton, Nav, Buttons, Popups } from "./styles";

const { setState: setPage } = usePage;

export const Navbar = () => (
	<Nav>
		<ThemeToggler />

		<ButtonsForPages />

		<Popups>
			<Converting />

			<Downloading />
		</Popups>
	</Nav>
);

const icons: Record<Page, JSX.Element> = Object.freeze({
	Favorites: <Favorites />,
	Download: <Download />,
	Settings: <Settings />,
	History: <History />,
	Convert: <Convert />,
	Home: <Home />,
});

const ButtonsForPages = () => {
	const currPage = usePage().page;

	return (
		<Buttons>
			{pages.map(page => (
				<Tooltip text={`Go to ${page}`} key={page} side="right">
					<ScaleUpIconButton
						className={page === currPage ? "active" : ""}
						onClick={() => setPage({ page })}
					>
						{icons[page]}
					</ScaleUpIconButton>
				</Tooltip>
			))}
		</Buttons>
	);
};

Navbar.whyDidYouRender = {
	customName: "Navbar",
};
