import { Roboto, Limelight } from "next/font/google";

// Centralized Roboto font configuration
export const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

// Limelight font configuration
export const limelight = Limelight({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  display: "swap",
  fallback: ["serif"],
});
