import type { ListChildComponentProps } from "react-window";
import type { MediaListKindProps } from "../MediaListKind/Change";
import type { Media } from "@common/@types/types";

import { useEffect, useReducer, useRef } from "react";
import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { IoReloadSharp as Reload } from "react-icons/io5";
import { FiTrash as Clean } from "react-icons/fi";
import { FixedSizeList } from "react-window";

import { useOnClickOutside } from "@hooks";
import { assertUnreachable } from "@utils/utils";
import { useMediaHandler } from "@renderer/contexts/mediaHandler";
import { dbg } from "@utils/app";

import { Img, Info, SubTitle, Title } from "../MediaListKind/styles";
import { Loading } from "@styles/appStyles";
import {
	SearchResultsWrapper,
	ReloadContainer,
	SearchWrapper,
	Wrapper,
	Search,
	Result,
	Button,
} from "./styles";

type Props = {
	buttonToTheSide: "reload button" | "clean" | "nothing";
	fromList: MediaListKindProps["mediaType"];
};

export function SearchMedia({ fromList, buttonToTheSide }: Props) {
	const {
		functions: {
			searchLocalComputerForMedias,
			dispatchPlaylists,
			searchForMedia,
		},
	} = useMediaHandler();

	const [searcher, dispatchSearcher] = useReducer(searcherReducer, {
		isLoading: false,
		searchTerm: "",
		results: [],
	});
	const searcherRef = useRef(null);

	useOnClickOutside(searcherRef, () => {
		dispatchSearcher({ type: "setSearchTerm", value: "" });
		dispatchSearcher({ type: "setResults", value: [] });
	});

	const reload = async () => {
		dispatchSearcher({ type: "setIsLoading", value: true });

		await searchLocalComputerForMedias(true);

		dispatchSearcher({ type: "setIsLoading", value: false });
	};

	const cleanHistory = () => {
		dbg("Sending msg to clean history.");

		dispatchPlaylists({
			type: "update history",
			whatToDo: "clean",
		});
	};

	useEffect(() => {
		if (searcher.searchTerm.length < 3) return;

		const searchTimeout = setTimeout(
			() =>
				dispatchSearcher({
					value: searchForMedia(searcher.searchTerm),
					type: "setResults",
				}),
			500,
		);

		return () => clearTimeout(searchTimeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searcher.searchTerm]);

	return (
		<Wrapper>
			<SearchWrapper ref={searcherRef}>
				<Search>
					<SearchIcon size="1.2em" />
					<input
						onChange={e =>
							dispatchSearcher({
								value: e.target.value,
								type: "setSearchTerm",
							})
						}
						placeholder="Search for artists, songs..."
						value={searcher.searchTerm}
						autoCapitalize="on"
						spellCheck="false"
						autoCorrect="off"
						type="text"
					/>
				</Search>

				{searcher.results.length > 0 && (
					<SearchResults results={searcher.results} fromList={fromList} />
				)}
			</SearchWrapper>

			{(() => {
				switch (buttonToTheSide) {
					case "reload button": {
						return (
							<ReloadContainer
								isSearching={searcher.isLoading}
								onClick={reload}
							>
								{searcher.isLoading ? (
									<div style={{ transform: "scale(0.3)", animation: "" }}>
										<Loading />
									</div>
								) : (
									<Reload size={17} color="#ccc" />
								)}
							</ReloadContainer>
						);
						break;
					}

					case "clean": {
						return (
							<Button>
								<Clean size={14} onClick={cleanHistory} />
							</Button>
						);
						break;
					}

					case "nothing": {
						return <></>;
						break;
					}

					default:
						return assertUnreachable(buttonToTheSide);
				}
			})()}
		</Wrapper>
	);
}

function SearchResults({
	results,
	fromList,
}: {
	fromList: MediaListKindProps["mediaType"];
	results: readonly Media[];
}) {
	const {
		functions: { dispatchCurrentPlaying },
		values: { playlists },
	} = useMediaHandler();

	const listWrapperReference = useRef<HTMLElement>(null);
	// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
	const playlist = playlists.find(({ name }) => name === fromList)!;
	if (!playlist) {
		console.error(`There should be "${fromList}" to search through!`);
		return null;
	}

	const playMedia = (media: Media) =>
		dispatchCurrentPlaying({
			type: "play this media",
			playlist,
			media,
		});

	const Row = ({
		index,
		data,
		style,
	}: ListChildComponentProps<readonly Media[]>) => {
		const media = data[index];

		return media ? (
			<Result key={media.path} onClick={() => playMedia(media)} style={style}>
				<Img>
					{media.img ? <img src={media.img} /> : <MusicNote size="1.4em" />}
				</Img>

				<Info>
					<Title style={{ marginLeft: "5px", textAlign: "left" }}>
						{media.title}
					</Title>
					<SubTitle style={{ marginLeft: "5px" }}>{media.duration}</SubTitle>
				</Info>
			</Result>
		) : null;
	};

	return (
		<SearchResultsWrapper ref={listWrapperReference}>
			<FixedSizeList
				itemKey={(index, results) => results[index].path}
				itemCount={results.length}
				itemData={results}
				className="list"
				itemSize={60}
				height={400}
				width={250}
			>
				{Row}
			</FixedSizeList>
		</SearchResultsWrapper>
	);
}

function searcherReducer(prev: SearcherProps, action: Action): SearcherProps {
	const { type } = action;

	switch (type) {
		case "setResults": {
			const ret: SearcherProps = {
				searchTerm: prev.searchTerm,
				isLoading: prev.isLoading,
				results: action.value,
			};

			return ret;
		}

		case "setSearchTerm": {
			const ret: SearcherProps = {
				isLoading: prev.isLoading,
				searchTerm: action.value,
				results: prev.results,
			};

			return ret;
		}

		case "setIsLoading": {
			const ret: SearcherProps = {
				searchTerm: prev.searchTerm,
				isLoading: action.value,
				results: prev.results,
			};

			return ret;
		}

		default:
			return assertUnreachable(type);
	}
}

type SearcherProps = Readonly<{
	results: readonly Media[];
	searchTerm: string;
	isLoading: boolean;
}>;

type Action =
	| Readonly<{ type: "setResults"; value: readonly Media[] }>
	| Readonly<{ type: "setIsLoading"; value: boolean }>
	| Readonly<{ type: "setSearchTerm"; value: string }>;
