import { IAboutBoxProps } from "./AboutBox.model";
import Image from "next/image";

export default function AboutBox(props: IAboutBoxProps) {
	return (
		<article className={props.className}>
			<div className="h-[120px] flex justify-center items-center">
				<Image src={props.imageURL} width={120} alt={props.title} />
			</div>
			<br />
			<h1 className="text-2xl font-[600] text-custom-dark-desaturated-blue text-center">
				{props.title}
			</h1>
			<p className=" font-[300] text-custom-dark-desaturated-blue text-center">{props.text}</p>
		</article>
	);
}