import { client as env } from "@/lib/env";

// SEO-related
export const title = "esaú morais - front-end engineer" as string;
export const description =
	"front-end engineer building what people need. creating unique and easy experiences." as string;
export const ogImage = "https://emots.dev/og_image.png" as string;
export const url = "https://emots.dev" as string;

// Environment
export const BASE_URL =
	process.env.NODE_ENV !== "development"
		? "https://emots.dev"
		: (env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000");
