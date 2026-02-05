export interface Experience {
	id: string;
	company: string;
	role: string;
	type: "full-time" | "contract" | "freelance";
	duration: { start: string; end: string | "present" };
	impacts: string[];
	technologies: string[];
	isCurrent: boolean;
}

export const experiences: Experience[] = [
	{
		id: "atomos-senior",
		company: "Atomos",
		role: "Front-End Engineer",
		type: "full-time",
		duration: { start: "JAN 2025", end: "DEC 2025" },
		isCurrent: false,
		impacts: [
			"Built Discord alert bot for production incidents, cutting debugging time by ~5x",
			"Architected Markdown-to-HTML migration pipeline with zero corruption across 5,000+ records",
			"Delivered investments broker dashboard redesign, increasing session duration by 25%",
			"Integrated AI suggestions into messaging system with dynamic variants",
		],
		technologies: ["React", "Next.js", "TypeScript", "OpenAI API"],
	},
	{
		id: "atomos-mid",
		company: "Atomos",
		role: "Mid-Level Front-End Developer",
		type: "full-time",
		duration: { start: "OCT 2023", end: "DEC 2024" },
		isCurrent: false,
		impacts: [
			"Refactored 2,000+ lines of code with 500+ unit tests",
			"Revamped dashboard with geolocation and 6 new statistics",
			"Managed main project with 18,000+ users",
			"Delivered landing page redesign in 2-day turnaround",
		],
		technologies: ["React", "TypeScript", "Jest", "Vitest"],
	},
	{
		id: "pd-solutions",
		company: "PD Solutions",
		role: "Junior Front-End Developer",
		type: "full-time",
		duration: { start: "MAR 2023", end: "OCT 2023" },
		isCurrent: false,
		impacts: [
			"Delivered inaugural version of a laboratory system with 90% average performance rating",
			"Built WiFi, Ethernet and USB (UDP/TCP) integrations with over 3 types of fire centrals serving Brazil's leading electronics company",
		],
		technologies: ["React", "TypeScript", "Next.js"],
	},
	{
		id: "alive-commerce",
		company: "Alive Commerce",
		role: "Junior Front-End Developer",
		type: "full-time",
		duration: { start: "APR 2022", end: "DEC 2022" },
		isCurrent: false,
		impacts: [
			"Maintained checkout flows and payment gateways for live-streaming e-commerce",
			"Optimized VTEX IO products with 10% increase in responsiveness",
			"Released 3 full-scale projects with 90+ average performance",
		],
		technologies: ["React", "VTEX IO", "TypeScript"],
	},
];
