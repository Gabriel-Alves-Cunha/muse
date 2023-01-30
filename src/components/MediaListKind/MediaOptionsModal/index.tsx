import type { Media, Path } from "@renderer/common/@types/generalTypes";

import { MdOutlineImageSearch as SearchImage } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as CloseIcon } from "react-icons/md";

import { DeleteMediaDialogContent } from "../../DeleteMediaDialog";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { useTranslation } from "@i18n";
import { CenteredModal } from "../../CenteredModal";
import { on, removeOn } from "@utils/window";
import { deleteFile } from "@utils/deleteFile";
import { Button } from "../../Button";
import { dbg } from "@renderer/common/debug";
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

export default function MediaOptionsModal({ media, path, setIsOpen }: Props) {
	const [isDeleteMediaModalOpen, setIsDeleteMediaModalOpen] = useState(false);
	const imageButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const imageFilePathRef = useRef("");
	const { t } = useTranslation();

	const openNativeUI_ChooseFiles = () => imageInputRef.current?.click();

	function handleSelectedFile({
		target: { files },
	}: React.ChangeEvent<HTMLInputElement>) {
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
	}

	useEffect(() => {
		function changeMediaMetadataOnEnter(event: KeyboardEvent) {
			if (event.key === "Enter" && !isAModifierKeyPressed(event)) {
				event.stopImmediatePropagation();

				changeMediaMetadata(imageFilePathRef.current, path, media);
			}
		}

		on("keyup", changeMediaMetadataOnEnter);

		return () => removeOn("keyup", changeMediaMetadataOnEnter);
	}, []);

	return (
		<>
			<h1 className="title">{t("dialogs.mediaOptions.title")}</h1>

			<h2 className="subtitle">{t("dialogs.mediaOptions.description")}</h2>

			<button
				className="close-media-options-modal"
				onPointerUp={() => setIsOpen(false)}
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
							// TODO: for god knows why, clicking the input makes electron reload the window!!
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
								/>

								{t("buttons.selectImg")}
							</Button>
						) : /////////////////////////////////////////////
						// Handle text input with line feeds:
						option === "lyrics" ? (
							<textarea
								onKeyUp={(e) =>
									// stopping propagation so the space and enter key don't do smth other.
									e.stopPropagation()
								}
								defaultValue={value}
								id={option}
							/>
						) : (
							/////////////////////////////////////////////
							// Else:
							<input
								onKeyUp={(e) =>
									// stopping propagation so the space key doesn't toggle play state.
									e.stopPropagation()
								}
								readOnly={!isChangeable(option)}
								defaultValue={format(value)}
								id={option}
							/>
						)}
					</fieldset>
				))}
			</form>

			<div data-flex-row>
				<>
					<button
						onPointerUp={() => setIsDeleteMediaModalOpen(true)}
						data-remove-media
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
							handleDeleteMedia={() => {
								setIsDeleteMediaModalOpen(false);
								setIsOpen(false);

								deleteFile(path).then();
							}}
							closeDialog={() => setIsDeleteMediaModalOpen(false)}
						/>
					</CenteredModal>
				</>

				<button
					className="save-media-options-modal"
					onPointerUp={() => {
						setIsOpen(false);

						changeMediaMetadata(imageFilePathRef.current, path, media);
					}}
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
