import type { Media, Path } from "@common/@types/generalTypes";

import { MdOutlineImageSearch as SearchImage } from "react-icons/md";
import { Suspense, useEffect, useRef, lazy } from "react";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as CloseIcon } from "react-icons/md";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { mediaOptionsModalId } from "../Row";
import { useTranslation } from "@i18n";
import { emptyString } from "@common/empty";
import { FlexRow } from "@components/FlexRow";
import { Button } from "@components/Button";
import { dbg } from "@common/debug";
import {
	changeMediaMetadata,
	handleMediaDeletion,
	optionsForUserToSee,
	isChangeable,
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
	const imageFilePathRef = useRef(emptyString);
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
			() => document.addEventListener("keyup", changeMediaMetadataOnEnter),
			500,
		);

		return () =>
			document.removeEventListener("keyup", changeMediaMetadataOnEnter);
	}, [media, path]);

	return (
		<>
			<h1 className="title">{t("dialogs.mediaOptions.title")}</h1>

			<h2 className="mt-3 mx-0 mb-5 font-secondary text-gray tracking-wide text-base">
				{t("dialogs.mediaOptions.description")}
			</h2>

			<CloseCenteredModal
				// outline: "initial"; h-9; rounded
				className="flex justify-center items-center h-6 cursor-pointer py-0 px-4 border-none whitespace-nowrap font-secondary tracking-wider font-semibold absolute right-2 top-2 rounded-full hover:bg-icon-button-hovered focus:bg-icon-button-hovered"
				title={t("tooltips.closeDialog")}
				htmlFor={mediaOptionsModalId}
				ref={closeButtonRef}
			>
				<CloseIcon className="fill-accent-light" />
			</CloseCenteredModal>

			<form id="form">
				{Object.entries(optionsForUserToSee(media)).map(([option, value]) => (
					<fieldset
						className="flex items-center h-9 gap-5 mb-4"
						key={option}
					>
						<label
							className="flex w-24 text-accent-light font-secondary tracking-wide text-right font-medium text-base"
							htmlFor={option}
						>
							{t(`labels.${option as OptionsForUserToSee}`)}
						</label>

						{option === "image" ? (
							/////////////////////////////////////////////
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
						/////////////////////////////////////////////
						// Handle text input with line feeds:
						option === "lyrics" ? (
							<textarea
								className="box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input rounded-xl p-3 whitespace-nowrap text-input font-secondary font-medium leading-none transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
								defaultValue={value}
								id={option}
							/>
						) : (
							<input
								className="box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input py-0 px-3 rounded-xl whitespace-nowrap text-input font-secondary tracking-wider text-base font-medium transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
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
						labelClassName="flex justify-between items-center max-h-9 gap-4 cursor-pointer bg-[#bb2b2e] py-0 px-4 border-none rounded tracking-wider text-white font-semibold leading-9 hover:bg-[#821e20] focus:bg-[#821e20] no-transition"
					>
						{t("buttons.deleteMedia")}

						<Remove />
					</CenteredModalTrigger>

					<CenteredModalContent htmlFor={deleteMediaModalID_mediaOptionsModal}>
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
					className="flex justify-center items-center h-6 cursor-pointer py-0 px-4 border-none whitespace-nowrap font-secondary tracking-wider font-semibold bg-[#ddf4e5] text-[#2c6e4f] hover:bg-[#c6dbce] focus:bg-[#c6dbce]"
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

type OptionsForUserToSee = keyof ReturnType<typeof optionsForUserToSee>;
