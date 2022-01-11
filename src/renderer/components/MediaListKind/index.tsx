import type { ListChildComponentProps } from "react-window";
import type { MediaListKindProps } from "./Change";
import type { Media } from "@common/@types/types";

import { IoMdMusicalNote as MusicNote } from "react-icons/io";
import { FixedSizeList, areEqual } from "react-window";
import { memo, useRef, useState } from "react";
import Popup from "reactjs-popup";

import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "./ImgWithFallback";
import { useMediaHandler } from "@contexts/mediaHandler";
import { Dots } from "../";

import { ListWrapper, SubTitle, Options, Title, Info, Img } from "./styles";
import { pulse } from "@styles/animations";

export function MediaListKind({ mediaType }: MediaListKindProps) {
	const {
		functions: { dispatchCurrentPlaying },
		values: { currentPlaying, playlists },
	} = useMediaHandler();

	const [showPopup, setShowPopup] = useState<Media>();
	const listWrapperRef = useRef<HTMLElement>(null);

	// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
	const mediaList = playlists.find(({ name }) => name === mediaType)!;
	if (!mediaList)
		console.error(
			`There should/must be a "${mediaType}"!\nplaylists =`,
			playlists,
		);

	const playMedia = (media: Media) =>
		dispatchCurrentPlaying({
			type: "play this media",
			playlist: mediaList,
			media,
		});

	const Row = memo(
		({ index, data, style }: ListChildComponentProps<readonly Media[]>) => {
			const media = data[index];

			return media ? (
				<div
					className={`row-wrapper ${
						media.path === currentPlaying.media?.path ? "active" : ""
					}`}
					style={style}
				>
					<div className="play-button" onClick={() => playMedia(media)}>
						<Img>
							<ImgWithFallback
								Fallback={<MusicNote size="1.4em" />}
								imgAsString={media.img ?? ""}
								urlAsACachekey={media.path}
							/>
						</Img>

						<Info>
							<Title>{media.title}</Title>
							<SubTitle>{media.duration}</SubTitle>
						</Info>
					</div>

					<Options
						onClick={() => setShowPopup(media)}
						onMouseDown={pulse}
						id={media.title}
					>
						<Dots />
					</Options>
				</div>
			) : null;
		},
		areEqual,
	);
	Row.displayName = "Row";

	return (
		<ListWrapper ref={listWrapperRef}>
			<FixedSizeList
				itemKey={(index, data) => data[index].path + Date.now()}
				itemCount={mediaList.list.length}
				itemData={mediaList.list}
				className="list"
				itemSize={60}
				height={400}
				width="100%"
			>
				{Row}
			</FixedSizeList>

			<Popup
				onClose={() => setShowPopup(undefined)}
				open={Boolean(showPopup)}
				position="center center"
				{...{ overlayStyle }}
				defaultOpen={false}
				repositionOnResize
				closeOnEscape
				lockScroll
				nested
			>
				{/* eslint-disable-next-line  @typescript-eslint/no-non-null-assertion */}
				<MediaOptionsModal media={showPopup!} />
			</Popup>
		</ListWrapper>
	);
}

export const overlayStyle = {
	background: "rgba(0,0,0,0.15)",
	backdropFilter: "blur(2px)",
} as const;
