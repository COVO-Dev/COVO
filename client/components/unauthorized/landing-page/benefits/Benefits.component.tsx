import Image from "next/image";
import {cardInformation} from "./Benefits.data"

export default function Benefits() {
	
	return (
		<div className="bg-custom-light-grayish-blue2">
			<div className="grid gap-2">
				<h1 className="text-5xl font-[700] text-custom-dark-desaturated-blue text-center">
					Benefits
				</h1>
				<p className="text-3xl font-[600] text-custom-lark-blue text-center">
					One Platform — Cost-Effective Influencer Marketing
				</p>
				<p className="text-1xl font-[600] text-custom-dark-desaturated-blue text-center">
					Simplify your influencer marketing with our all-in-one platform,
					offering cost-effective solutions while streamlining your influencer
					marketing efforts and maximize ROI with our affordable platform.
				</p>
			</div>
			<br />
			<div className="flex flex-wrap gap-2 justify-center items-center">
				{cardInformation.map((cardObject) => (
					<div
						key={cardObject.id}
						className="bg-white bg-[url('/svg/BG.svg')] w-[400px] h-[400px] rounded-lg border-custom-light-grayish-blue border-2 flex flex-col justify-center items-center p-4"
					>
						<div className="flex justify-center items-center h-[100px]">
						<Image
							src={cardObject.url}
							alt={`Brand logo ${cardObject.id}`}
							width={200}
							height={200}
							className="w-[100px] h-auto "
						/>
						</div>
						<br />
						<p className="text-2xl font-[600] text-custom-dark-desaturated-blue text-center">
							{cardObject.text}
						</p>
						<p className=" font-[300] text-custom-dark-desaturated-blue text-center">
							{cardObject.supText}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
