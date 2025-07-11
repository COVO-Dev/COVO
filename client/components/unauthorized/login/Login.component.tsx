import LoginBoxImage from "./login-box-image/LoginBoxImage";
import LoginBox from "./login-box/LoginBox";

export default function Login() {
	return (
		<main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
			{/* Background gradient overlay matching Home page */}
			<div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-60"></div>

			{/* Main container with Home page styling */}
			<div className='bg-white backdrop-blur-xl border border-gray-100 p-8 sm:p-10 lg:p-12 rounded-2xl shadow-2xl shadow-gray-900/10 z-40 flex flex-col items-center justify-center md:flex-row md:w-auto w-[95%] max-w-5xl relative'>
				{/* Subtle gradient overlay for visual depth */}
				<div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-transparent to-gray-50/10 pointer-events-none rounded-2xl"></div>

				<LoginBoxImage />
				<LoginBox />
			</div>
		</main>
	);
}
