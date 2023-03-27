import type { Media, Path } from "@common/@types/GeneralTypes";

import { useCallback, useRef, useState } from "react";
import { MdOutlineImageSearch as SearchImage } from "react-icons/md";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as CloseIcon } from "react-icons/md";
import { useSnapshot } from "valtio";

import { DeleteMediaDialogContent } from "../../DeleteMediaDialog";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { CenteredModal } from "../../CenteredModal";
import { translation } from "@i18n";
import { deleteFile } from "@utils/deleteFile";
import { Button } from "../../Button";
import { dbg } from "@common/debug";
import {
	type VisibleData,
	changeMediaMetadata,
	isChangeable,
	visibleData,
	format,
} from "./helpers";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

const filePresentClassName = "file-present";

export function MediaOptionsModal({ media, path, setIsOpen }: Props) {
	const t = useSnapshot(translation).t;

	const [isDeleteMediaModalOpen, setIsDeleteMediaModalOpen] = useState(false);

	const imageButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const imageFilePathRef = useRef("");

	const openNativeUI_ChooseFiles = useCallback(
		() => imageInputRef.current?.click(),
		[],
	);

	const handleSelectedFile = useCallback(
		({ target: { files } }: React.ChangeEvent<HTMLInputElement>) => {
			console.log("on handleSelectedFile");

			if (
				!(imageButtonRef.current && imageInputRef.current && files) ||
				files.length === 0
			)
				return imageButtonRef.current?.classList.remove(filePresentClassName);

			const [file] = files;

			imageFilePathRef.current = file!.webkitRelativePath;

			dbg("imageFilePath =", imageFilePathRef.current);

			// Change button color to indicate that selection was successfull:
			imageButtonRef.current.classList.add(filePresentClassName);
		},
		[],
	);

	const saveChanges = useCallback(() => {
		setIsOpen(false);

		changeMediaMetadata(imageFilePathRef.current, path, media);
	}, [path, media]);

	const handleDeleteMedia = useCallback(() => {
		setIsDeleteMediaModalOpen(false);
		setIsOpen(false);

		deleteFile(path);
	}, [path]);

	const closeDeleteMediaDialog = useCallback(
		() => setIsDeleteMediaModalOpen(false),
		[],
	);

	const openDeleteMediaDialog = useCallback(
		() => setIsDeleteMediaModalOpen(true),
		[],
	);

	const closeMediaOptionsModal = useCallback(() => setIsOpen(false), []);

	function changeMediaMetadataOnEnter(event: KeyEvent) {
		event.stopPropagation();

		if (event.key === "Enter" && !isAModifierKeyPressed(event)) saveChanges();
	}

	return (
		<>
			<h1 className="title">{t("dialogs.mediaOptions.title")}</h1>

			<h2 className="subtitle">{t("dialogs.mediaOptions.description")}</h2>

			<button
				className="close-media-options-modal"
				onPointerUp={closeMediaOptionsModal}
				title={t("tooltips.closeDialog")}
				ref={closeButtonRef}
			>
				<CloseIcon />
			</button>

			<form id="form">
				{visibleData(media).map(([option, value]) => (
					<fieldset key={option}>
						<label htmlFor={option}>
							{t(`labels.${option as OptionsForUserToSee}`)}
						</label>

						{option === "image" ? (
							/////////////////////////////////////////////
							// Handle file input for image:
							// TODO: for god knows why, clicking the input makes electron reload the window!! maybe permission stuff??
							<Button
								onPointerUp={openNativeUI_ChooseFiles}
								ref={imageButtonRef}
								variant="input"
							>
								<SearchImage size={18} />

								<input
									onChange={handleSelectedFile}
									ref={imageInputRef}
									accept="image/*"
									type="file"
									id={option}
								/>

								{t("buttons.selectImg")}
							</Button>
						) : /////////////////////////////////////////////
						// Handle text input with line feeds:
						option === "lyrics" ? (
							<textarea
								// Stopping propagation so the space key doesn't toggle play state:
								// @ts-ignore
								onKeyDown={changeMediaMetadataOnEnter}
								defaultValue={value}
								name={option}
								id={option}
							/>
						) : (
							/////////////////////////////////////////////
							// Else:
							<input
								// Stopping propagation so the space key doesn't toggle play state:
								// @ts-ignore
								onKeyDown={changeMediaMetadataOnEnter}
								readOnly={!isChangeable(option)}
								defaultValue={format(value)}
								name={option}
								id={option}
								type="text"
							/>
						)}
					</fieldset>
				))}
			</form>

			<div data-flex-row>
				<>
					<button onPointerUp={openDeleteMediaDialog} data-remove-media>
						{t("buttons.deleteMedia")}

						<Remove />
					</button>

					<CenteredModal
						setIsOpen={setIsDeleteMediaModalOpen}
						className="confirm-remove-media"
						isOpen={isDeleteMediaModalOpen}
					>
						<DeleteMediaDialogContent
							handleDeleteMedia={handleDeleteMedia}
							closeDialog={closeDeleteMediaDialog}
						/>
					</CenteredModal>
				</>

				<button className="save-media-options-modal" onPointerUp={saveChanges}>
					{t("buttons.saveChanges")}
				</button>
			</div>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = {
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	media: Media;
	path: Path;
};

/////////////////////////////////////////////

type OptionsForUserToSee = keyof VisibleData;

/////////////////////////////////////////////

type KeyEvent = React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>;
