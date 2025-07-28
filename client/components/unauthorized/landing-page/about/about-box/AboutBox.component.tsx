import { IAboutBoxProps } from "./AboutBox.model";
import Image from "next/image";

export default function AboutBox(props: IAboutBoxProps) {
	return (
		<article className={props.className}>
			{/* Icon container */}
			<div className="mb-6">
				<div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
					<Image
						src={props.imageURL}
						width={32}
						height={32}
						alt={props.title}
						className="w-8 h-8"
					/>
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4">
				<h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
					{props.title}
				</h3>
				<p className="text-gray-600 leading-relaxed">
					{props.text}
				</p>
			</div>
		</article>
	);
}