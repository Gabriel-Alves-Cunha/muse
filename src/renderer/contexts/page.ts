import { observable } from "@legendapp/state";

// The order here is the order on the navbar:
export const pages = [
	"Home",
	"Favorites",
	"History",
	"Download",
	"Convert",
] as const;

export const page = observable<Page>("Home");

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

export type Page = typeof pages[number];
