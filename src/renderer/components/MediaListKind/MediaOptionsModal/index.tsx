import type { Media, Path } from "@common/@types/GeneralTypes";

import { useRef, useState } from "react";
import {
	MdOutlineImageSearch as SearchImage,
	MdOutlineDelete as Remove,
	MdClose as CloseIcon,
} from "react-icons/md";

import { DeleteMediaDialogContent } from "../../DeleteMediaDialog";
import { selectT, useTranslator } from "@i18n";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { CenteredModal } from "../../CenteredModal";
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

const FILE_PRESENT_CLASS_NAME = "file-present";

export function MediaOptionsModal({
	setIsOpen,
	media,
	path,
}: Props): JSX.Element {
	const t = useTranslator(selectT);

	const [isDeleteMediaModalOpen, setIsDeleteMediaModalOpen] = useState(false);

	const imageButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const imageFilePathRef = useRef("");

	function handleSelectedFile({
		target: { files },
	}: React.ChangeEvent<HTMLInputElement>): void {
		console.log("on handleSelectedFile");

		if (
			!(imageButtonRef.current && imageInputRef.current && files) ||
			files.length === 0
		) {
			imageButtonRef.current?.classList.remove(FILE_PRESENT_CLASS_NAME);

			return;
		}

		const [file] = files;

		imageFilePathRef.current = file?.webkitRelativePath ?? "";

		dbg("imageFilePath =", imageFilePathRef.current);

		// Change button color to indicate that selection was successfull:
		imageButtonRef.current.classList.add(FILE_PRESENT_CLASS_NAME);
	}

	function saveChanges(): void {
		setIsOpen(false);

		changeMediaMetadata(imageFilePathRef.current, path, media);
	}

	function handleDeleteMedia(): void {
		setIsDeleteMediaModalOpen(false);
		setIsOpen(false);

		deleteFile(path);
	}

	const openNativeUI_ChooseFiles = (): void => imageInputRef.current?.click();

	const closeDeleteMediaDialog = (): void => setIsDeleteMediaModalOpen(false);

	const openDeleteMediaDialog = (): void => setIsDeleteMediaModalOpen(true);

	const closeMediaOptionsModal = (): void => setIsOpen(false);

	function changeMediaMetadataOnEnter(event: KeyEvent): void {
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
				type="button"
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
					<button
						onPointerUp={openDeleteMediaDialog}
						data-remove-media
						type="button"
					>
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

				<button
					className="save-media-options-modal"
					onPointerUp={saveChanges}
					type="button"
				>
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
