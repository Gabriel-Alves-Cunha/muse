import type { Media, Path } from "@common/@types/generalTypes";

import { Suspense, useEffect, useRef, useState } from "react";
import { MdOutlineImageSearch as SearchImage } from "react-icons/md";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as CloseIcon } from "react-icons/md";

import { DeleteMediaDialogContent } from "../../DeleteMediaDialog";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { once, removeOn } from "@utils/window";
import { useTranslation } from "@i18n";
import { CenteredModal } from "@components/CenteredModal";
import { deleteFile } from "@utils/deleteFile";
import { Button } from "@components/Button";
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
		if (
			!(imageButtonRef.current && imageInputRef.current && files) ||
			files.length === 0
		)
			return;

		const [file] = files;

		imageFilePathRef.current = file!.webkitRelativePath;

		dbg("imageFilePath =", imageFilePathRef.current);

		// Change button color to indicate that selection was successfull:
		imageButtonRef.current.classList.add("file-present");
	}

	useEffect(() => {
		function changeMediaMetadataOnEnter(event: KeyboardEvent) {
			if (event.key === "Enter" && !isAModifierKeyPressed(event))
				changeMediaMetadata(imageFilePathRef.current, path, media);
		}

		once("keyup", changeMediaMetadataOnEnter);

		return () => removeOn("keyup", changeMediaMetadataOnEnter);
	}, [media, path]);

	return (
		<>
			<h1 className="title text-center">{t("dialogs.mediaOptions.title")}</h1>

			<h2 className="subtitle">{t("dialogs.mediaOptions.description")}</h2>

			<button
				onPointerUp={() => setIsOpen(false)}
				className="close-media-options-modal"
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
							<Button
								onPointerUp={openNativeUI_ChooseFiles}
								className="no-transition"
								ref={imageButtonRef}
								variant="input"
								id={option}
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
							<textarea defaultValue={value} id={option} />
						) : (
							/////////////////////////////////////////////
							// Else:
							<input
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
						className="confirm-remove-media"
						isOpen={isDeleteMediaModalOpen}
					>
						<Suspense>
							<DeleteMediaDialogContent
								deleteMediaPlusCloseDialog={() => {
									setIsDeleteMediaModalOpen(false);
									setIsOpen(false);

									deleteFile(path).then();
								}}
							/>
						</Suspense>
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
