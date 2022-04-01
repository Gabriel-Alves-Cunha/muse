import type { Page } from "@common/@types/typesAndEnums";

import {
	MdOutlineVideoLibrary as Home,
	MdOutlineSettings as Settings,
	MdFavoriteBorder as Favorites,
	MdCloudDownload as Download,
	MdSwapHoriz as Convert,
	MdHistory as History,
} from "react-icons/md";

import { Downloading, Converting } from "@modules";
import { ThemeToggler } from "@modules/ThemeToggler";
import { usePage } from "@contexts";
import { pages } from "@utils/app";

import { ScaleUpIconButton, Nav, Buttons } from "./styles";

const { setState: setPage } = usePage;

export const Navbar = () => (
	<Nav>
		<ThemeToggler />

		<ButtonsForPages />

		<Downloading />
		<Converting />
	</Nav>
);

const ButtonsForPages = () => {
	const currPage = usePage().page;

	return (
		<Buttons>
			{pages.map(page => (
				<ScaleUpIconButton
					className={page === currPage ? "active" : ""}
					onMouseDown={e => e.preventDefault()}
					// ^ Takes focus off of button so that the `outline` css can be applied
					onClick={() => setPage({ page })}
					aria-label={"Go to " + page}
					key={page}
				>
					{icon(page)}
				</ScaleUpIconButton>
			))}
		</Buttons>
	);
};

const icon = (folder: Page) => iconObj[folder];

const iconObj: Record<Page, JSX.Element> = Object.freeze({
	Favorites: <Favorites />,
	Download: <Download />,
	Settings: <Settings />,
	History: <History />,
	Convert: <Convert />,
	Home: <Home />,
});
