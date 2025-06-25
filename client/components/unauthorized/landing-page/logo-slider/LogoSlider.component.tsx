import Image from "next/image";

export default function LogoSlider() {
	const imageURLs = [
		{ url: "/images/pngwing_pepsi.png", id: 1 },
		{ url: "/images/pngwingAdidas.png", id: 2 },
		{ url: "/images/pngwingBarbie.png", id: 3 },
		{ url: "/images/pngwingBurberry.png", id: 4 },
		{ url: "/images/pngwingCalvinKlein.png", id: 5 },
		{ url: "/images/pngwingPuma.png", id: 6 },
		{ url: "/images/pngwingZara.png", id: 7 },
	];

	return (
		<div className="relative min-w-[1000px] md:w-full overflow-hidden bg-custom-light-grayish-blue2 border-2 border-custom-light-grayish-blue">
			<div className="flex animate-scroll">
				{/* First set of images */}
				<div className="flex min-w-full justify-around items-center py-8">
					{imageURLs.map((imageObject) => (
						<Image
							key={imageObject.id}
							src={imageObject.url}
							alt={`Brand logo ${imageObject.id}`}
							width={150}
							height={150}
							className="w-[100px] h-auto filter grayscale transition-opacity hover:grayscale-0"
						/>
					))}
				</div>
				{/* Duplicate set of images for seamless loop */}
				<div className="flex min-w-full justify-around items-center py-8">
					{imageURLs.map((imageObject) => (
						<Image
							key={`dup-${imageObject.id}`}
							src={imageObject.url}
							alt={`Brand logo ${imageObject.id}`}
							width={150}
							height={150}
							className="w-[100px] h-auto filter grayscale transition-opacity hover:grayscale-0"
						/>
					))}
				</div>
			</div>
		</div>
	);
}
