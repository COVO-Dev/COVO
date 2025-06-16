"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginBox() {
  const [error, setError] = useState("");
  const [loggedInSuccessfully, setLoggedInSuccessfully] = useState("");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleLogin = async () => {
    const response = await signIn("credentials", {
      redirect: false,
      email: loginData.email,
      password: loginData.password,
    });
    if (response?.error) {
      setError(response.error as string);
      console.log(error)
    } else if (response?.ok) {
      router.refresh();
      setLoggedInSuccessfully(`log in successful`);
    }

  };

  return (
    <div className="pt-8 rounded-lg  w-auto max-w-80 z-50 relative flex-col items-center justify-center">
      {error && (
        <p className="mb-4 text-sm font-bold text-red-500 absolute top-0 left-1/2 transform -translate-x-1/2 w-full text-center">
          {error}
        </p>
      )}
      {loggedInSuccessfully && (
        <p className="mb-4 text-sm font-bold text-green-500 absolute top-0 left-1/2 transform -translate-x-1/2 w-full text-center">
          {loggedInSuccessfully}
        </p>
      )}

      <input
        type="email"
        name="email"
        value={loginData.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setLoginData((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder="Email"
        className="mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 text-custom-dark-desaturated-blue placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      <input
        type="password"
        name="password"
        value={loginData.password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setLoginData((prev) => ({ ...prev, password: e.target.value }))
        }
        placeholder="Password"
        className="mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50  text-custom-dark-desaturated-blue placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />

      <button
        onClick={handleLogin}
        className="w-full mb-2 p-3 rounded-md bg-custom-dark-desaturated-blue text-white hover:bg-gray-600 focus:outline-none transition-transform duration-200 ease-in-out hover:scale-105"
      >
        Sign In
      </button>
      <h1 className="text-custom-dark-desaturated-blue text-center text-sm pt-2">
        Don&apos;t have account?{" "}
        <Link className="text-custom-lark-blue" href={"/signup"}>
          SignUp
        </Link>
      </h1>
      <h1 className="text-custom-dark-desaturated-blue text-center text-sm pt-2">
        Forgot Password?{" "}
        <Link className="text-custom-lark-blue" href={"/forgot-password"}>
          Reset
        </Link>
      </h1>
    </div>
  );
}
