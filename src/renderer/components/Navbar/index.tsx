import { ButtonsForPages } from "./ButtonsForPages";
import { ThemeToggler } from "../ThemeToggler";
import { Downloading } from "../Downloading";
import { Converting } from "../Converting";

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
