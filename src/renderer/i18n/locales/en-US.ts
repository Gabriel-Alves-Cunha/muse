import { Translations } from ".";

export const en_US_Translations: Translations = Object.freeze({
	translations: {
		dialogs: {
			mediaOptions: {
				title: "Edit/See media information",
				description:
					"Make changes to your media's metadata here. Click save when	you're done.",
			},
			deleteMedia: {
				subtitle:
					"Are you sure you want to delete this media from your computer?",
			},
			sharingMedia: "Sharing media",
		},

		tooltips: {
			showAllDownloadingMedias: "Show all downloading medias",
			showAllConvertingMedias: "Show all converting medias",
			toggleMinimizeWindow: "Toggle minimize window",
			toggleMaximizeWindow: "Toggle maximize window",
			toggleLoopThisMedia: "Toggle loop this media",
			cancelConversion: "Cancel/Remove conversion",
			cancelDownload: "Cancel/Remove download",
			playPreviousTrack: "Play previous sound",
			openMediaOptions: "Open media options",
			toggleOpenLyrics: "Toggle open lyrics",
			closeShareScreen: "Close share screen",
			reloadAllMedias: "Reload all medias",
			toggleFavorite: "Toggle favorite",
			playNextTrack: "Play next track",
			playThisMedia: "Play this media",
			toggleRandom: "Toggle random",
			closeDialog: "Close dialog",
			closeWindow: "Close window",
			toggleTheme: "Toggle theme",
			cleanList: "Clean list",
			playPause: "Play/Pause",
			sortBy: "Sort by",
			goto: "Go to ",
		},

		buttons: {
			resetAllAppData: "Reset all app data",
			convert: "Select media(s) to convert",
			cleanFinished: "Clean finished",
			reloadWindow: "Reload window",
			selectImg: "Select an image",
			deleteMedia: "Delete media",
			saveChanges: "Save changes",
			download: "Download",
			confirm: "Confirm",
			cancel: "Cancel",
		},

		labels: {
			pasteVideoURL: "Paste YouTube url here",
			searchForSongs: "Search for songs",
			duration: "Duration",
			genres: "Genres",
			artist: "Artist",
			lyrics: "Lyrics",
			album: "Album",
			image: "Image",
			title: "Title",
			size: "Size",
		},

		toasts: {
			mediaMetadataNotSaved:
				"Unable to save new metadata. See console by pressing Ctrl+Shift+i.",
			assureMediaHasArtistMetadata: "Make sure that media has artist metadata!",
			mediaMetadataSaved: "New media metadata has been saved.",
			convertAlreadyExists: "There is already one convert of ",
			downloadAlreadyExists: "There is already one download of ",
			conversionCanceled: "Conversion cancelled for ",
			conversionSuccess: "Conversion  succeded for ",
			downloadCanceled: "Download cancelled for ",
			conversionFailed: "Conversion failed for ",
			downloadSuccess: "Download succeded for ",
			noLyricsFound: "No lyrics found for ",
			mediaDeletionSuccess: "Deleted ",
			mediaDeletionError: {
				beforePath: "Could not delete ",
				afterPath: "\nSee console by pressing 'Ctrl'+'Shift'+'i'!",
			},
			conversionError: {
				beforePath: "There was an error trying to convert ",
				afterPath: "! Please, try again later.",
			},
			downloadError: { beforePath: "Download of ", afterPath: " failed!" },
		},

		errors: {
			mediaListKind: {
				errorFallbackDescription:
					"Rendering the list threw an error. This is probably a bug. Try	closing and opening the app, if the error persists, click on the button below.",
				errorTitle: "Something went wrong",
			},
			gettingMediaInfo: "There was an error getting media information!",
			noVideoIdFound: "No video ID found!",
		},

		alts: {
			museLogo: "Muse's logo, a donut-like circle with shades of blue.",
			videoThumbnail: "Video thumbnail",
			noMediasFound: "No medias found",
		},

		sortTypes: { name: "Name", date: "Date" },

		ctxMenus: {
			toggleDevTools: "Toggle Developer Tools",
			searchForLyrics: "Search for lyrics",
			selectAllMedias: "Select all medias",
			deleteMedia: "Delete media",
			shareMedia: "Share media",
		},

		infos: {
			noConversionsInProgress: "No conversions in progress",
			noDownloadsInProgress: "No downloads in progress",
			converted: "Converted",
		},

		decorations: { size: "Size", medias: "medias", selected: "selected" },

		pages: {
			Favorites: "Favorites",
			Download: "Download",
			History: "History",
			Convert: "Convert",
			Home: "Home",
		},

		titles: {
			download: "Download medias files to audio files",
			convert: "Convert medias files to mp3",
			history: "History of audios played",
			favorites: "My favorite audios",
			home: "List of all audios",
		},
	},
});
