import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

export function BaseInput({ label, RightSlot, ...props }: Props) {
	return (
		<div className="relative flex justify-start items-center w-80 h-10 border-2 border-solid border-input cursor-default rounded-xl bg-none transition-all ease-out duration-200 search-media">
			<SearchIcon className="w-5 h-5 text-alternative cursor-default mx-3 duration-100" />

			<label className="absolute flex items-center h-9 left-[2.7rem] bottom-0 right-0 top-0 p-0 text-placeholder whitespace-nowrap font-secondary tracking-wider font-normal text-base cursor-default pointer-events-none">
				{label}
			</label>

			<input
				// flex: 1 === occupy all remaining width
				className="flex items-center flex-1 h-9 whitespace-nowrap text-input font-primary cursor-text tracking-wider text-base font-medium outline-none bg-transparent border-none"
				{...props}
			/>

			{RightSlot && RightSlot}
		</div>
	);
}

interface Props
	extends React.DetailedHTMLProps<
		React.InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	> {
	readonly RightSlot?: JSX.Element | null | undefined;
	readonly label: string;
}
