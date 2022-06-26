import type { Page } from "@common/@types/generalTypes";

import { GrShareOption as Share } from "react-icons/gr";
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

import { Nav, Buttons, PopupsWrapper } from "./styles";

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

const icons: Record<Page, JSX.Element> = Object.freeze({
	Favorites: <Favorites />,
	Download: <Download />,
	Settings: <Settings />,
	History: <History />,
	Convert: <Convert />,
	Share: <Share />,
	Home: <Home />,
});

function ButtonsForPages() {
	const currPage = usePage().page;

	return (
		<Buttons>
			{pages.map(page => (
				<button
					className={page === currPage ? "active" : ""}
					onClick={() => setPage({ page })}
					data-tip={`Go to ${page}`}
					key={page}
				>
					{icons[page]}
				</button>
			))}
		</Buttons>
	);
}
