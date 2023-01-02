import { ButtonsForPages } from "./ButtonsForPages";
import { ThemeToggler } from "@components/ThemeToggler";
import { Downloading } from "@components/Downloading";
import { Converting } from "@components/Converting";

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
