// forgot-password/page.tsx
import ForgotPasswordBoxImage from "./forgot-password-box-image/ForgotPasswordBoxImage";
import ForgotPasswordBox from "./forgot-password-box/ForgotPasswordBox";

export default function ForgotPassword() {
	return (
		<main className="h-[calc(100dvh-100px)] flex items-center justify-center p-6 relative overflow-hidden bg-custom-very-soft-blue bg-[url('/svg/BG.svg')] bg-no-repeat bg-cover">
			<div className='bg-custom-light-grayish-blue bg-[url("/svg/BG.svg")] p-10 rounded-lg shadow-md z-40 flex flex-col items-center justify-center h-[37em] md:h-[25em] md:flex-row md:w-auto w-[97%] '>
				<ForgotPasswordBoxImage />
				<ForgotPasswordBox />
			</div>
		</main>
	);
}
