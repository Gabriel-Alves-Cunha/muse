import type { Media, Page } from "@common/@types/generalTypes";

import { areArraysEqualByValue } from "@utils/array";
import { pt_BR_Translations } from "./pt-BR";
import { en_US_Translations } from "./en-US";
import { getObjectDeepKeys } from "@utils/object";

const { error } = console;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main:

// Make sure to use the apropriate abreviations!!
// https://support.mozilla.org/pt-BR/kb/abreviacao-de-localizacao
export const translations = Object.freeze({
	"pt-BR": pt_BR_Translations,
	"en-US": en_US_Translations,
});

/////////////////////////////////////////////

// Assure all translations are complete:
// @ts-ignore => isDev is a globally defined boolean.
if (isDev) {
	const pt_BR_TranslationsKeys = getObjectDeepKeys(pt_BR_Translations);
	const en_US_TranslationsKeys = getObjectDeepKeys(en_US_Translations);
	const areEqual = areArraysEqualByValue(
		pt_BR_TranslationsKeys,
		en_US_TranslationsKeys,
	);

	if (!areEqual)
		error(
			{ pt_BR_TranslationsKeys, en_US_TranslationsKeys },
			"Are translation keys the same?",
			areEqual,
		);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type Translations = Readonly<{
	translations: {
		dialogs: {
			mediaOptions: { title: string; description: string };
			deleteMedia: { subtitle: string };
			sharingMedia: string;
		};

		tooltips: {
			showAllDownloadingMedias: string;
			showAllConvertingMedias: string;
			toggleMinimizeWindow: string;
			toggleMaximizeWindow: string;
			toggleLoopThisMedia: string;
			playPreviousTrack: string;
			closeShareScreen: string;
			toggleOpenLyrics: string;
			openMediaOptions: string;
			cancelConversion: string;
			reloadAllMedias: string;
			toggleFavorite: string;
			cancelDownload: string;
			playNextTrack: string;
			playThisMedia: string;
			toggleRandom: string;
			closeDialog: string;
			closeWindow: string;
			toggleTheme: string;
			cleanList: string;
			playPause: string;
			sortBy: string;
			goto: string;
		};

		buttons: {
			resetAllAppData: string;
			cleanFinished: string;
			reloadWindow: string;
			deleteMedia: string;
			saveChanges: string;
			selectImg: string;
			download: string;
			convert: string;
			confirm: string;
			cancel: string;
		};

		labels: Labels & { searchForSongs: string; pasteVideoURL: string };

		toasts: {
			conversionError: { beforePath: string; afterPath: string };
			downloadError: { beforePath: string; afterPath: string };
			mediaDeletionError: { beforePath: string; afterPath: string };
			assureMediaHasArtistMetadata: string;
			downloadAlreadyExists: string;
			mediaMetadataNotSaved: string;
			convertAlreadyExists: string;
			mediaDeletionSuccess: string;
			mediaMetadataSaved: string;
			conversionCanceled: string;
			conversionSuccess: string;
			conversionFailed: string;
			downloadCanceled: string;
			downloadSuccess: string;
			noLyricsFound: string;
		};

		errors: {
			mediaListKind: {
				errorFallbackDescription: string;
				errorTitle: string;
			};
			gettingMediaInfo: string;
			noVideoIdFound: string;
		};

		alts: {
			videoThumbnail: string;
			noMediasFound: string;
			museLogo: string;
		};

		sortTypes: { name: string; date: string };

		ctxMenus: {
			selectAllMedias: string;
			searchForLyrics: string;
			toggleDevTools: string;
			deleteMedia: string;
			shareMedia: string;
		};

		infos: {
			noConversionsInProgress: string;
			noDownloadsInProgress: string;
			converted: string;
		};

		decorations: { size: string; medias: string; selected: string };

		pages: Record<Page, string>;

		titles: {
			favorites: string;
			download: string;
			history: string;
			convert: string;
			home: string;
		};
	};
}>;

/////////////////////////////////////////////

type Labels = Omit<Record<keyof Media, string>, "birthTime">;
