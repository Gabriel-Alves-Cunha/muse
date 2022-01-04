import type { videoInfo } from "ytdl-core";

import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useEffect, useReducer } from "react";

import { assertUnreachable } from "@utils/utils";
import { getErrorMessage } from "@utils/error";
import { useInterComm } from "@contexts/communicationBetweenChildren";
import { Loading } from "@styles/appStyles";
const { getInfo } = electron.notificationApi;

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
			type: "startDownload",
		});
	}

	async function search(url: string) {
		dispatchSearcher({ type: "setLoadingToTrue" });

		try {
			const info = (await getInfo(url)) as videoInfo;
			const title = info.videoDetails.title;

			const metadata: UrlMediaMetadata = {
				imageURL: info.videoDetails.thumbnails.at(-1)?.url ?? "",
				// ^ Highest quality is last in this array.
				songTitle: info.videoDetails.media.song ?? title,
				artist: info.videoDetails.media.artist ?? "",
				title,
			};

			dispatchSearcher({ type: "setResult", value: metadata });
		} catch (error) {
			if (getErrorMessage(error).includes("No video id found"))
				dispatchSearcher({
					value: "No video ID found!",
					type: "setError",
				});
			else
				dispatchSearcher({
					value: "There was an error getting media information!",
					type: "setError",
				});

			throw error;
		}
	}

	useEffect(() => {
		if (!searcher.searchTerm || searcher.searchTerm.length < 8) return;

		const searchTimeout = setTimeout(
			async () => await search(searcher.searchTerm),
			400
		);

		return () => clearTimeout(searchTimeout);
	}, [searcher.searchTerm]);

	const setSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) =>
		dispatchSearcher({
			value: e.target.value.trim(),
			type: "setSearchTerm",
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
	action: Action
): SearcherProps {
	const { type } = action;
	switch (type) {
		case "setError": {
			const ret: SearcherProps = {
				searchTerm: previous.searchTerm,
				error: action.value,
				result: undefined,
				isLoading: false,
			};

			return ret;
		}

		case "setResult": {
			const ret: SearcherProps = {
				searchTerm: previous.searchTerm,
				result: action.value,
				isLoading: false,
				error: "",
			};

			return ret;
		}

		case "setSearchTerm": {
			const ret: SearcherProps = {
				searchTerm: action.value,
				result: undefined,
				isLoading: false,
				error: "",
			};

			return ret;
		}

		case "setLoadingToTrue": {
			const ret: SearcherProps = {
				searchTerm: previous.searchTerm,
				result: previous.result,
				isLoading: true,
				error: "",
			};

			return ret;
		}

		default:
			return assertUnreachable(type);
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
	| Readonly<{ type: "setResult"; value: UrlMediaMetadata | undefined }>
	| Readonly<{ type: "setError"; value: NonNullable<string> }>
	| Readonly<{ type: "setSearchTerm"; value: string }>
	| Readonly<{ type: "setLoadingToTrue" }>;
