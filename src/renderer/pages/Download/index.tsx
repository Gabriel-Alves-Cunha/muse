import type { ChangeEvent } from "react";
import type { videoInfo } from "ytdl-core";

import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect, useReducer } from "react";

import { assertUnreachable } from "@utils/utils";
import { getErrorMessage } from "@utils/error";
import { Loading } from "@styles/appStyles";
import {
	Type as MsgType,
	useInterComm,
} from "@contexts/communicationBetweenChildren";
const { getInfo } = electron.media;

import { Wrapper, SearchWrapper, Searcher, Result, Button } from "./styles";

export function Download() {
	const { sendMsg } = useInterComm();

	const [searcher, dispatchSearcher] = useReducer(searcherReducer, {
		result: undefined,
		isLoading: false,
		searchTerm: "",
		error: "",
	});

	async function download(url: string) {
		if (!searcher.result) return;

		sendMsg({
			value: {
				imageURL: searcher.result.imageURL,
				title: searcher.result.title,
				canStartDownload: true,
				url,
			},
			type: MsgType.START_DOWNLOAD,
		});
	}

	async function search(url: string) {
		dispatchSearcher({ type: Type.SET_LOADING_TO_TRUE });
		let metadata: UrlMediaMetadata | undefined = undefined;

		try {
			const info = (await getInfo(url)) as videoInfo;
			const title = info.videoDetails.title;

			metadata = {
				imageURL: info.videoDetails.thumbnails.at(-1)?.url ?? "",
				// ^ Highest quality is last in this array.
				songTitle: info.videoDetails.media.song ?? title,
				artist: info.videoDetails.media.artist ?? "",
				title,
			};
		} catch (error) {
			if (getErrorMessage(error).includes("No video id found"))
				dispatchSearcher({
					value: "No video ID found!",
					type: Type.SET_ERROR,
				});
			else
				dispatchSearcher({
					value: "There was an error getting media information!",
					type: Type.SET_ERROR,
				});

			throw error;
		} finally {
			dispatchSearcher({ type: Type.SET_RESULT, value: metadata });
		}
	}

	useEffect(() => {
		if (!searcher.searchTerm || searcher.searchTerm.length < 8) return;

		const searchTimeout = setTimeout(
			async () => await search(searcher.searchTerm),
			400,
		);

		return () => clearTimeout(searchTimeout);
	}, [searcher.searchTerm]);

	const setSearchTerm = (e: ChangeEvent<HTMLInputElement>) =>
		dispatchSearcher({
			value: e.target.value.trim(),
			type: Type.SET_SEARCH_TERM,
		});

	return (
		<Wrapper>
			<SearchWrapper>
				<Searcher>
					<SearchIcon size="1.2em" />
					<input
						placeholder="Paste Youtube url here!"
						value={searcher.searchTerm}
						onChange={setSearchTerm}
						autoCapitalize="off"
						spellCheck="false"
						autoCorrect="off"
						type="text"
					/>
				</Searcher>

				{searcher.error && <p>{searcher.error}</p>}

				<div
					style={{
						transform: "scale(0.3)",
						position: "relative",
						marginLeft: "1rem",
					}}
				>
					{searcher.isLoading && <Loading />}
				</div>
			</SearchWrapper>

			{searcher.result && (
				<Result>
					<img src={searcher.result.imageURL} alt="thumbnail" />

					<p>{searcher.result.title}</p>

					<Button onClick={() => download(searcher.searchTerm)}>
						Download
					</Button>
				</Result>
			)}
		</Wrapper>
	);
}

Download.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "Download",
};

function searcherReducer(
	previous: SearcherProps,
	action: Action,
): SearcherProps {
	switch (action.type) {
		case Type.SET_ERROR: {
			const ret: SearcherProps = {
				searchTerm: previous.searchTerm,
				error: action.value,
				result: undefined,
				isLoading: false,
			};

			return ret;
		}

		case Type.SET_RESULT: {
			const ret: SearcherProps = {
				searchTerm: previous.searchTerm,
				result: action.value,
				isLoading: false,
				error: "",
			};

			return ret;
		}

		case Type.SET_SEARCH_TERM: {
			const ret: SearcherProps = {
				searchTerm: action.value,
				result: undefined,
				isLoading: false,
				error: "",
			};

			return ret;
		}

		case Type.SET_LOADING_TO_TRUE: {
			const ret: SearcherProps = {
				searchTerm: previous.searchTerm,
				result: previous.result,
				isLoading: true,
				error: "",
			};

			return ret;
		}

		default:
			return assertUnreachable(action);
	}
}

type UrlMediaMetadata = Readonly<{
	songTitle: string;
	imageURL: string;
	artist: string;
	title: string;
}>;

type SearcherProps = Readonly<{
	result: UrlMediaMetadata | undefined;
	isLoading: boolean;
	searchTerm: string;
	error: string;
}>;

type Action =
	| Readonly<{ type: Type.SET_RESULT; value: UrlMediaMetadata | undefined }>
	| Readonly<{ type: Type.SET_ERROR; value: NonNullable<string> }>
	| Readonly<{ type: Type.SET_SEARCH_TERM; value: string }>
	| Readonly<{ type: Type.SET_LOADING_TO_TRUE }>;

enum Type {
	SET_LOADING_TO_TRUE,
	SET_SEARCH_TERM,
	SET_RESULT,
	SET_ERROR,
}
