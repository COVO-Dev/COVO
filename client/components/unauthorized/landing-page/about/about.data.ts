import { Roboto } from "next/font/google";
import { Limelight } from "next/font/google";
import growth_analytics from "@/assets/svg/growth_analytics.svg"
import job_hunt from "@/assets/svg/job_hunt.svg"
import team_collaboration from "@/assets/svg/team_collaboration.svg"
import transfer_money from "@/assets/svg/transfer_money.svg"

export const limelight = Limelight({
	subsets: ["latin"],
	weight: ["400"],
	style: ["normal"],
	display: "swap",
});

export const roboto = Roboto({
	subsets: ["latin"],
	weight: ["400", "700"],
	style: ["normal", "italic"],
	display: "swap",
});

export const AboutArray = [
	{
		title: "DISCOVER OPPORTUNITIES",
		text: "Find tailored campaigns that align with your niche and audience.",
		bgColor: "bg-blue-400 ",
		imageURL: job_hunt,
		id: 1,
	},
	{
		title: "EFFICIENT COLLABORATION",
		text: "Streamlined communication and project management tools.",
		bgColor: "bg-blue-300 ",
		imageURL: team_collaboration,
		id: 2,
	},
	{
		title: "FAIR COMPENSATION",
		text: "Transparent payment terms and competitive rates.",
		bgColor: "bg-blue-200 ",
		imageURL: transfer_money,
		id: 3,
	},
	{
		title: "GROW YOUR BRAND",
		text: "Gain exposure, build your following , and establish yourself as an industry leader.",
		bgColor: "bg-blue-100 ",
		imageURL: growth_analytics,
		id: 4,
	},
];
