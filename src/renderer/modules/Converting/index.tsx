import { useEffect, useRef, useState } from "react";
import { MdCompareArrows as Convert } from "react-icons/md";

import { ReactToElectronMessageEnum } from "@common/@types/electron-window";

import { useOnClickOutside } from "@hooks";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@styles/global";
import { Tooltip } from "@components";
import {
	setConvertInfoList,
	useConvertInfoList,
	useConvertingList,
	createNewConvert,
	Popup,
} from "./helper";

import { Trigger, Wrapper } from "../Downloading/styles";

// This prevents an infinite loop:
const constRefToEmptyArray = Object.freeze([]);

export function Converting() {
	const [showPopup, setShowPopup] = useState(false);
	const popupRef = useRef<HTMLDivElement>(null);
	const convertInfoList = useConvertInfoList();
	const convertingList = useConvertingList();

	useOnClickOutside(popupRef, () => setShowPopup(false));

	useEffect(() => {
		convertInfoList.forEach(convertValue => {
			if (convertValue.canStartConvert)
				try {
					const electronPort = createNewConvert(convertValue);

					// Sending port so we can communicate with electron:
					sendMsgToBackend(
						{
							type: ReactToElectronMessageEnum.CONVERT_MEDIA,
						},
						electronPort,
					);
				} catch (error) {
					errorToast(
						`There was an error trying to download "${convertValue.path}"! Please, try again later.`,
					);

					console.error(error);
				}
		});

		// Once all downloads are handled, we can remove the values from the list,
		// this also prevents an infinite loop (when it reaches the end, the comparison
		// will be true because of the const reference to the empty array):
		setConvertInfoList(constRefToEmptyArray);
	}, [convertInfoList]);

	useEffect(() => {
		const handleEscKey = ({ key }: KeyboardEvent) =>
			key === "Escape" && setShowPopup(false);

		window.addEventListener("keydown", handleEscKey);

		return () => window.removeEventListener("keydown", handleEscKey);
	}, []);

	return (
		<Wrapper ref={popupRef}>
			<Tooltip text="Show all converting medias" arrow={false} side="right">
				<Trigger
					onClick={() => setShowPopup(prev => !prev)}
					className={
						(convertingList.length ? "has-downloads " : "") +
						(showPopup ? "active" : "")
					}
				>
					<i data-length={convertingList.length}></i>
					<Convert size={20} />
				</Trigger>
			</Tooltip>

			{showPopup && <Popup convertList={convertingList} />}
		</Wrapper>
	);
}

Converting.whyDidYouRender = {
	customName: "Converting",
};
