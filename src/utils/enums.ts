export const ProgressStatus = {
	WAITING_FOR_CONFIRMATION: 2,
	SUCCESS: 3,
	ACTIVE: 4,
	CANCEL: 5,
	FAILED: 6,
} as const;

/////////////////////////////////////////////

export const playlistList = {
	mainList: "sortedByTitleAndMainList",
	sortedByDate: "sortedByDate",
	favorites: "favorites",
	history: "history",
} as const;
