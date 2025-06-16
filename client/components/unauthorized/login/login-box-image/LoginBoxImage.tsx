import Image from 'next/image';
import COVO_LOGOGRAM_BLACKs from "@/assets/images/COVO_LOGOGRAM_BLACK.png"


export default function LoginBoxImage() {
	return (
		<div className="flex items-center justify-center w-[390px] md">
			<div className='w-[300px] h-[120px] md:w-[400px] md:h-[400px] flex items-center justify-center'>
				<Image src={COVO_LOGOGRAM_BLACKs} alt="Logo" width={300} height={300} />
			</div>
		</div>
	);
};
