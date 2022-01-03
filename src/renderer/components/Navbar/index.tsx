import type { Page } from "@common/@types/types";

import { AiOutlineQuestion as Question } from "react-icons/ai";
import { VscArrowDown as Downloading } from "react-icons/vsc";
import { BsArrowLeftRight as Convert } from "react-icons/bs";
import { RiSettings3Fill as Settings } from "react-icons/ri";
import { AiOutlineHistory as History } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { MdFavorite as Favorites } from "react-icons/md";
import { RiHomeFill as Home } from "react-icons/ri";

import { capitalize } from "@utils/utils";
import { folders } from "@utils/app";

import { FolderButton, Nav, Text } from "./styles";

export function Navbar() {
	const { pathname } = useLocation();

	const navigate = useNavigate();

	return (
		<Nav>
			{folders.map((folder) => (
				<FolderButton
					className={
						folder === capitalize(pathname.replace("/", "")) ? "active" : ""
					}
					onClick={() => navigate("/" + folder.toLowerCase())}
					onMouseDown={(e) => e.preventDefault()}
					// ^ Takes focus off of button so that the `outline` css can be applied
					key={folder}
				>
					<span>{icon(folder)}</span>
					<Text>{folder}</Text>
				</FolderButton>
			))}
		</Nav>
	);
}

const icon = (folder: Page) => iconMap.get(folder) ?? <Question size="1em" />;
const iconMap = new Map<Page, JSX.Element>();

iconMap.set("Download", <Downloading size="1em" />);
iconMap.set("Favorites", <Favorites size="1em" />);
iconMap.set("Settings", <Settings size="1em" />);
iconMap.set("History", <History size="1em" />);
iconMap.set("Convert", <Convert size="1em" />);
iconMap.set("Home", <Home size="1em" />);

Navbar.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "Navbar",
};
