// SignUp/page.tsx
import SignUpBoxImage from "./signup-box-image/SignUpBoxImage";
import SignUpBox from "./signup-box/SignUpBox";

export default function SignUp() {
  return (
    <main className="h-[calc(100dvh-100px)] flex items-center justify-center p-6 relative overflow-hidden bg-custom-very-soft-blue bg-[url('/svg/BG.svg')] bg-no-repeat bg-cover">
      <div className='bg-custom-light-grayish-blue bg-[url("/svg/BG.svg")] p-10 rounded-lg shadow-md z-40 flex flex-col items-center justify-center h-auto md:flex-row md:w-auto w-[97%]  '>
        <SignUpBoxImage />
        <SignUpBox />
      </div>
    </main>
  );
}
