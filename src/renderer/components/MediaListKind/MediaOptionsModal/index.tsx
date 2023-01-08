import type { Media, Path } from "@common/@types/generalTypes";

import { MdOutlineImageSearch as SearchImage } from "react-icons/md";
import { Suspense, useEffect, useRef, lazy } from "react";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as CloseIcon } from "react-icons/md";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { mediaOptionsModalId } from "../Row";
import { useTranslation } from "@i18n";
import { FlexRow } from "@components/FlexRow";
import { Button } from "@components/Button";
import { dbg } from "@common/debug";
import {
	type VisibleData,
	changeMediaMetadata,
	handleMediaDeletion,
	isChangeable,
	visibleData,
	format,
} from "./helpers";
import {
	CenteredModalContent,
	CenteredModalTrigger,
	CloseCenteredModal,
} from "@components/CenteredModal";

const DeleteMediaDialogContent = lazy(() => import("../../DeleteMediaDialog"));

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

const deleteMediaModalID_mediaOptionsModal = "delete-modal-media-options-modal";

export default function MediaOptionsModal({ media, path }: Props) {
	const imageButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLLabelElement>(null);
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
				changeMediaMetadata(
					closeButtonRef,
					imageFilePathRef.current,
					path,
					media,
				);
		}

		// This is because if you open the popover by pressing
		// "Enter", it will just open and close it!
		setTimeout(
			() =>
				document.addEventListener("keyup", changeMediaMetadataOnEnter, {
					once: true,
				}),
			200,
		);

		return () =>
			document.removeEventListener("keyup", changeMediaMetadataOnEnter);
	}, [media, path]);

	return (
		<>
			<h1 className="title text-center">{t("dialogs.mediaOptions.title")}</h1>

			<h2 className="subtitle">{t("dialogs.mediaOptions.description")}</h2>

			<CloseCenteredModal
				className="close-media-options-modal"
				title={t("tooltips.closeDialog")}
				htmlFor={mediaOptionsModalId}
				ref={closeButtonRef}
			>
				<CloseIcon />
			</CloseCenteredModal>

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

			<FlexRow>
				<>
					<CenteredModalTrigger
						htmlTargetName={deleteMediaModalID_mediaOptionsModal}
						labelClassName="remove-media"
					>
						{t("buttons.deleteMedia")}

						<Remove />
					</CenteredModalTrigger>

					<CenteredModalContent
						htmlFor={deleteMediaModalID_mediaOptionsModal}
						className="confirm-remove-media"
						closeOnClickOutside
					>
						<Suspense>
							<DeleteMediaDialogContent
								idOfModalToBeClosed={deleteMediaModalID_mediaOptionsModal}
								handleMediaDeletion={() =>
									handleMediaDeletion(closeButtonRef, path)
								}
							/>
						</Suspense>
					</CenteredModalContent>
				</>

				<CloseCenteredModal
					className="save-media-options-modal"
					htmlFor={mediaOptionsModalId}
					onPointerUp={() =>
						changeMediaMetadata(
							closeButtonRef,
							imageFilePathRef.current,
							path,
							media,
						)
					}
				>
					{t("buttons.saveChanges")}
				</CloseCenteredModal>
			</FlexRow>
		</>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = { media: Media; path: Path };

/////////////////////////////////////////////

type OptionsForUserToSee = keyof VisibleData;
