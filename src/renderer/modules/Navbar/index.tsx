import type { Page } from "@common/@types/generalTypes";

import {
	MdOutlineVideoLibrary as Home,
	MdOutlineSettings as Settings,
	MdFavoriteBorder as Favorites,
	MdCloudDownload as Download,
	MdSwapHoriz as Convert,
	MdHistory as History,
} from "react-icons/md";

import { TooltipButton } from "@components/TooltipButton";
import { ThemeToggler } from "@modules/ThemeToggler";
import { Downloading } from "@modules/Downloading";
import { Converting } from "@modules/Converting";
import { usePage } from "@contexts/page";
import { pages } from "@utils/app";

import { Nav, Buttons, Popups } from "./styles";

const { setState: setPage } = usePage;

export const Navbar = () => (
	<Nav className="notransition">
		<ThemeToggler />

		<ButtonsForPages />

		<Popups >
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
				<TooltipButton
					className={(page === currPage ? "active" : "")}
					onClick={() => setPage({ page })}
					tooltip={`Go to ${page}`}
					tooltip-side="right"
					key={page}
				>
					{icons[page]}
				</TooltipButton>
			))}
		</Buttons>
	);
};
